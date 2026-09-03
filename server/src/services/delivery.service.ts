import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { HTTP_STATUS } from '../constants/index.js';
import { OrderService } from './order.service.js';
import { NotificationService } from './notification.service.js';
import { AuditService } from './audit.service.js';
import { getSocketIoInstance } from '../socket/index.js';

export class DeliveryService {
  public static async getAvailableDeliveryPartners() {
    // Return the ONE Zavora delivery boy
    const driver = await prisma.deliveryBoy.findFirst({
      include: {
        user: {
          select: { id: true, name: true, phone: true, avatarUrl: true, email: true },
        },
        orders: {
          where: {
            status: {
              in: [
                'DELIVERY_ASSIGNED',
                'DELIVERY_ACCEPTED',
                'ARRIVED_AT_RESTAURANT',
                'PICKED_UP',
                'ON_THE_WAY',
              ],
            },
          },
        },
      },
    });

    if (!driver) return [];

    return [
      {
        id: driver.id,
        userId: driver.userId,
        name: driver.user.name,
        phone: driver.user.phone,
        avatarUrl: driver.user.avatarUrl,
        vehicleType: driver.vehicleType,
        vehicleNumber: driver.vehicleNumber,
        isOnline: driver.isOnline,
        isAvailable: driver.isAvailable && driver.orders.length === 0,
        activeOrdersCount: driver.orders.length,
        rating: driver.rating,
        totalDeliveries: driver.totalDeliveries,
        currentLatitude: driver.currentLatitude,
        currentLongitude: driver.currentLongitude,
      },
    ];
  }

  public static async assignDriver(
    orderId: string,
    deliveryBoyId: string,
    assignedByUserId: string
  ) {
    return OrderService.assignZavoraDeliveryBoy(orderId, assignedByUserId);
  }

  public static async acceptAssignment(orderId: string, deliveryBoyId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    if (order.status !== 'DELIVERY_ASSIGNED') {
      throw new AppError(`Cannot accept order in status ${order.status}`, HTTP_STATUS.BAD_REQUEST);
    }

    await prisma.deliveryAssignment.updateMany({
      where: { orderId, deliveryBoyId, status: 'ASSIGNED' },
      data: { status: 'ACCEPTED', respondedAt: new Date() },
    });

    const updated = await OrderService.updateOrderStatus(orderId, 'DELIVERY_ACCEPTED', {
      userId,
      role: 'DELIVERY_BOY',
    });

    return updated;
  }

  public static async markArrivedAtRestaurant(orderId: string, userId: string) {
    return OrderService.updateOrderStatus(orderId, 'ARRIVED_AT_RESTAURANT', {
      userId,
      role: 'DELIVERY_BOY',
    });
  }

  public static async markFoodPickedUp(orderId: string, userId: string) {
    return OrderService.updateOrderStatus(orderId, 'PICKED_UP', {
      userId,
      role: 'DELIVERY_BOY',
    });
  }

  public static async startDelivery(orderId: string, userId: string) {
    return OrderService.updateOrderStatus(orderId, 'ON_THE_WAY', {
      userId,
      role: 'DELIVERY_BOY',
    });
  }

  public static async completeDelivery(orderId: string, userId: string) {
    return OrderService.updateOrderStatus(orderId, 'DELIVERED', {
      userId,
      role: 'DELIVERY_BOY',
    });
  }

  public static async getActiveDelivery(deliveryBoyId: string) {
    const order = await prisma.order.findFirst({
      where: {
        deliveryBoyId,
        status: {
          in: [
            'DELIVERY_ASSIGNED',
            'DELIVERY_ACCEPTED',
            'ARRIVED_AT_RESTAURANT',
            'PICKED_UP',
            'ON_THE_WAY',
          ],
        },
      },
      include: {
        restaurant: true,
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        items: {
          include: { foodItem: true },
        },
        address: true,
        deliveryBoy: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return order;
  }

  public static async getEarnings(deliveryBoyId: string) {
    const driver = await prisma.deliveryBoy.findUnique({
      where: { id: deliveryBoyId },
    });

    if (!driver) {
      throw new AppError('Delivery partner profile not found', HTTP_STATUS.NOT_FOUND);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await prisma.order.findMany({
      where: {
        deliveryBoyId,
        status: 'DELIVERED',
        deliveredAt: { gte: today },
      },
    });

    const todayEarnings = todayOrders.length * 45.0;

    return {
      totalEarnings: driver.totalEarnings,
      totalDeliveries: driver.totalDeliveries,
      todayDeliveries: todayOrders.length,
      todayEarnings,
      rating: driver.rating,
      payoutRatePerTrip: 45.0,
    };
  }

  public static async toggleOnlineStatus(deliveryBoyId: string, isOnline: boolean) {
    const updated = await prisma.deliveryBoy.update({
      where: { id: deliveryBoyId },
      data: { isOnline },
    });

    const io = getSocketIoInstance();
    if (io) {
      io.to('admin:dashboard').emit('driver:status-changed', {
        deliveryBoyId,
        isOnline,
        isAvailable: updated.isAvailable,
      });
    }

    return updated;
  }

  public static async getDeliveryHistory(deliveryBoyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          deliveryBoyId,
          status: 'DELIVERED',
        },
        skip,
        take: limit,
        orderBy: { deliveredAt: 'desc' },
        include: {
          restaurant: { select: { name: true, address: true } },
          customer: { select: { name: true, phone: true } },
          items: true,
        },
      }),
      prisma.order.count({
        where: {
          deliveryBoyId,
          status: 'DELIVERED',
        },
      }),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
