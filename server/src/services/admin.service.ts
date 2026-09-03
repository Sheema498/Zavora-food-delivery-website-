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
      completedOrders,
      pendingOrders,
      rejectedOrders,
      cancelledOrders,
      activeOrders,
      totalCustomers,
      deliveredOrdersAggregate,
      todayDeliveredAggregate,
      deliveryBoy,
      manager,
      allDeliveredCount,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'RESTAURANT_REJECTED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
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
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true, subtotal: true, deliveryFee: true, taxAmount: true },
        _avg: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { status: 'DELIVERED', createdAt: { gte: today } },
        _sum: { totalAmount: true },
      }),
      prisma.deliveryBoy.findFirst({
        include: { user: { select: { name: true, phone: true, email: true } } },
      }),
      prisma.restaurantManager.findFirst({
        include: { user: { select: { name: true, phone: true, email: true } } },
      }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
    ]);

    const totalSales = deliveredOrdersAggregate._sum.totalAmount || 0;
    const todaySales = todayDeliveredAggregate._sum.totalAmount || 0;
    const avgOrderValue = deliveredOrdersAggregate._avg.totalAmount || (totalOrders > 0 ? totalSales / totalOrders : 0);

    // 7-day revenue trend
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
      completedOrders,
      pendingOrders,
      rejectedOrders,
      cancelledOrders,
      activeOrders,
      totalSales: Math.round(totalSales * 100) / 100,
      todaySales: Math.round(todaySales * 100) / 100,
      totalRevenue: Math.round(totalSales * 100) / 100,
      averageOrderValue: Math.round(avgOrderValue * 100) / 100,
      deliveryCompletedCount: allDeliveredCount,
      customerCount: totalCustomers,
      managerActivity: manager
        ? {
            id: manager.id,
            name: manager.user.name,
            email: manager.user.email,
            status: 'Active on Duty',
          }
        : null,
      deliveryBoyActivity: deliveryBoy
        ? {
            id: deliveryBoy.id,
            name: deliveryBoy.user.name,
            vehicle: deliveryBoy.vehicleNumber,
            isOnline: deliveryBoy.isOnline,
            isAvailable: deliveryBoy.isAvailable,
            totalDeliveries: deliveryBoy.totalDeliveries,
            totalEarnings: deliveryBoy.totalEarnings,
          }
        : null,
      revenueTrend,
    };
  }

  // Real database analytics across date ranges
  public static async getAnalytics(range: 'today' | 'yesterday' | '7days' | '30days' | 'monthly' = '7days') {
    const now = new Date();
    let startDate = new Date();

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'yesterday') {
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '7days') {
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '30days' || range === 'monthly') {
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    const ordersInRange = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      include: {
        items: {
          include: {
            foodItem: {
              include: { category: true },
            },
          },
        },
      },
    });

    const totalOrders = ordersInRange.length;
    let totalSales = 0;
    let itemsSold = 0;
    let completedDeliveries = 0;
    let cancelledOrders = 0;
    let rejectedOrders = 0;

    const foodPerformanceMap: Record<
      string,
      { foodName: string; categoryName: string; quantitySold: number; totalRevenue: number; orderCount: number }
    > = {};

    const categoryAnalyticsMap: Record<
      string,
      { category: string; orders: number; quantitySold: number; revenue: number }
    > = {};

    ordersInRange.forEach((ord) => {
      if (ord.status === 'DELIVERED') {
        totalSales += ord.totalAmount;
        completedDeliveries += 1;
      } else if (ord.status === 'CANCELLED') {
        cancelledOrders += 1;
      } else if (ord.status === 'RESTAURANT_REJECTED') {
        rejectedOrders += 1;
      }

      const seenCategoriesInOrder = new Set<string>();

      ord.items.forEach((it) => {
        itemsSold += it.quantity;

        // Food item stats
        const key = it.foodItemId;
        const catName = it.foodItem?.category?.name || 'General';
        if (!foodPerformanceMap[key]) {
          foodPerformanceMap[key] = {
            foodName: it.name,
            categoryName: catName,
            quantitySold: 0,
            totalRevenue: 0,
            orderCount: 0,
          };
        }
        foodPerformanceMap[key].quantitySold += it.quantity;
        foodPerformanceMap[key].totalRevenue += it.totalPrice;
        foodPerformanceMap[key].orderCount += 1;

        // Category stats
        if (!categoryAnalyticsMap[catName]) {
          categoryAnalyticsMap[catName] = {
            category: catName,
            orders: 0,
            quantitySold: 0,
            revenue: 0,
          };
        }
        categoryAnalyticsMap[catName].quantitySold += it.quantity;
        categoryAnalyticsMap[catName].revenue += it.totalPrice;
        seenCategoriesInOrder.add(catName);
      });

      seenCategoriesInOrder.forEach((catName) => {
        if (categoryAnalyticsMap[catName]) {
          categoryAnalyticsMap[catName].orders += 1;
        }
      });
    });

    const foodPerformance = Object.values(foodPerformanceMap)
      .map((item) => ({
        foodName: item.foodName,
        categoryName: item.categoryName,
        quantitySold: item.quantitySold,
        totalRevenue: Math.round(item.totalRevenue * 100) / 100,
        percentageOfOrders: totalOrders > 0 ? Math.round((item.orderCount / totalOrders) * 100) : 0,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    const categoryAnalytics = Object.values(categoryAnalyticsMap)
      .map((cat) => ({
        category: cat.category,
        orders: cat.orders,
        quantitySold: cat.quantitySold,
        revenue: Math.round(cat.revenue * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const averageOrderValue =
      completedDeliveries > 0 ? Math.round((totalSales / completedDeliveries) * 100) / 100 : 0;

    return {
      range,
      totalOrders,
      itemsSold,
      totalSales: Math.round(totalSales * 100) / 100,
      averageOrderValue,
      completedDeliveries,
      cancelledOrders,
      rejectedOrders,
      foodPerformance,
      categoryAnalytics,
      topSelling: foodPerformance.slice(0, 5),
      lowSelling: foodPerformance.slice(-5).reverse(),
    };
  }

  // Super Admin order inspection (NO live GPS exposed)
  public static async getLiveOrders() {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          notIn: ['DELIVERED', 'RESTAURANT_REJECTED', 'CANCELLED'],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: {
          select: { id: true, name: true, phone: true, address: true },
        },
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        deliveryBoy: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        items: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        payments: true,
      },
    });

    // STRIP GPS COORDINATES FOR SUPER ADMIN
    return orders.map((ord) => ({
      ...ord,
      deliveryBoy: ord.deliveryBoy
        ? {
            id: ord.deliveryBoy.id,
            vehicleType: ord.deliveryBoy.vehicleType,
            vehicleNumber: ord.deliveryBoy.vehicleNumber,
            isOnline: ord.deliveryBoy.isOnline,
            user: ord.deliveryBoy.user,
            currentLatitude: null,
            currentLongitude: null,
          }
        : null,
    }));
  }

  public static async listOrders(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          items: true,
          deliveryBoy: {
            include: { user: { select: { name: true, phone: true } } },
          },
          payments: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Strip live GPS
    const sanitized = orders.map((o) => ({
      ...o,
      deliveryBoy: o.deliveryBoy
        ? {
            ...o.deliveryBoy,
            currentLatitude: null,
            currentLongitude: null,
          }
        : null,
    }));

    return {
      orders: sanitized,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  public static async toggleUserStatus(userId: string, isActive: boolean, adminUserId: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    await AuditService.log({
      userId: adminUserId,
      action: isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      resource: 'User',
      resourceId: userId,
      metadata: { newStatus: isActive },
    });

    return updated;
  }

  public static async broadcastNotification(
    data: { title: string; message: string; targetRole?: string },
    adminUserId: string
  ) {
    const where: any = { isActive: true };
    if (data.targetRole && data.targetRole !== 'ALL') {
      where.role = data.targetRole;
    }
    const users = await prisma.user.findMany({ where, select: { id: true } });
    for (const u of users) {
      await NotificationService.send({
        userId: u.id,
        title: data.title,
        message: data.message,
        type: 'SYSTEM',
      });
    }

    await AuditService.log({
      userId: adminUserId,
      action: 'SYSTEM_BROADCAST_SENT',
      resource: 'Notification',
      metadata: { targetRole: data.targetRole, count: users.length },
    });

    return { count: users.length };
  }
}
