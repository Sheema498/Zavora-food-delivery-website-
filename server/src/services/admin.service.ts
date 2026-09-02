import prisma from '../lib/prisma.js';
import { Role } from '../types/index.js';
import { NotificationService } from './notification.service.js';
import { AuditService } from './audit.service.js';

export class AdminService {
  public static async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      activeOrders,
      totalUsers,
      totalRestaurants,
      totalDrivers,
      onlineDrivers,
      deliveredOrdersAggregate,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({
        where: {
          status: {
            in: [
              'PENDING',
              'RESTAURANT_ACCEPTED',
              'PREPARING',
              'READY_FOR_PICKUP',
              'DELIVERY_ASSIGNED',
              'DELIVERY_ACCEPTED',
              'ARRIVED_AT_RESTAURANT',
              'PICKED_UP',
              'ON_THE_WAY',
            ],
          },
        },
      }),
      prisma.user.count(),
      prisma.restaurant.count(),
      prisma.deliveryPartnerProfile.count(),
      prisma.deliveryPartnerProfile.count({ where: { isOnline: true } }),
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true, deliveryFee: true, taxAmount: true },
      }),
    ]);

    const totalGmv = deliveredOrdersAggregate._sum.totalAmount || 0;
    const platformCommission = totalGmv * 0.15; // 15% platform take
    const platformDeliveryRevenue = deliveredOrdersAggregate._sum.deliveryFee || 0;

    // Recent 7 days order count & revenue chart data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, totalAmount: true, status: true },
    });

    const dailyRevenueMap: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyRevenueMap[key] = { date: key, revenue: 0, orders: 0 };
    }

    recentOrders.forEach((ord) => {
      const key = ord.createdAt.toISOString().split('T')[0];
      if (dailyRevenueMap[key]) {
        dailyRevenueMap[key].orders += 1;
        if (ord.status === 'DELIVERED') {
          dailyRevenueMap[key].revenue += ord.totalAmount;
        }
      }
    });

    const revenueTrend = Object.values(dailyRevenueMap).reverse();

    return {
      totalOrders,
      todayOrders,
      activeOrders,
      totalUsers,
      totalRestaurants,
      totalDrivers,
      onlineDrivers,
      totalGmv: Math.round(totalGmv * 100) / 100,
      platformCommission: Math.round(platformCommission * 100) / 100,
      platformDeliveryRevenue: Math.round(platformDeliveryRevenue * 100) / 100,
      revenueTrend,
    };
  }

  public static async getLiveOrders() {
    return prisma.order.findMany({
      where: {
        status: {
          notIn: ['DELIVERED', 'RESTAURANT_REJECTED', 'CANCELLED'],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: {
          select: { id: true, name: true, phone: true, latitude: true, longitude: true },
        },
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        deliveryPartner: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        items: true,
      },
    });
  }

  public static async listUsers(role?: Role, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  public static async toggleUserStatus(userId: string, isActive: boolean, adminUserId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    await AuditService.log({
      userId: adminUserId,
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      resource: 'User',
      resourceId: userId,
    });

    return user;
  }

  public static async broadcastNotification(
    data: { title: string; message: string; targetRole?: Role },
    adminUserId: string
  ) {
    const where: Record<string, unknown> = { isActive: true };
    if (data.targetRole) {
      where.role = data.targetRole;
    }

    const targetUsers = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    for (const u of targetUsers) {
      await NotificationService.send({
        userId: u.id,
        title: data.title,
        message: data.message,
        type: 'SYSTEM',
      });
    }

    await AuditService.log({
      userId: adminUserId,
      action: 'NOTIFICATION_BROADCAST',
      resource: 'Notification',
      metadata: { targetCount: targetUsers.length, targetRole: data.targetRole },
    });

    return { success: true, count: targetUsers.length };
  }
}
