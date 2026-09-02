import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { HTTP_STATUS } from '../constants/index.js';
import { calculateDistanceKm, estimateTravelMinutes } from '../utils/geo.utils.js';
import { OrderService } from './order.service.js';
import { NotificationService } from './notification.service.js';
import { AuditService } from './audit.service.js';
import { getSocketIoInstance } from '../socket/index.js';

export class DeliveryService {
  public static async getAvailableDeliveryPartners(restaurantLat?: number, restaurantLng?: number) {
    const drivers = await prisma.deliveryPartnerProfile.findMany({
      where: {
        isOnline: true,
        user: { isActive: true },
      },
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

    return drivers.map((d) => {
      let distanceToRestaurant = 0;
      if (restaurantLat !== undefined && restaurantLng !== undefined) {
        distanceToRestaurant = calculateDistanceKm(
          { latitude: d.currentLatitude, longitude: d.currentLongitude },
          { latitude: restaurantLat, longitude: restaurantLng }
        );
      }

      return {
        id: d.id,
        userId: d.userId,
        name: d.user.name,
        phone: d.user.phone,
        avatarUrl: d.user.avatarUrl,
        vehicleType: d.vehicleType,
        vehicleNumber: d.vehicleNumber,
        isOnline: d.isOnline,
        isAvailable: d.isAvailable && d.orders.length === 0,
        activeOrdersCount: d.orders.length,
        rating: d.rating,
        totalDeliveries: d.totalDeliveries,
        currentLatitude: d.currentLatitude,
        currentLongitude: d.currentLongitude,
        distanceToRestaurantKm: distanceToRestaurant,
      };
    });
  }

  public static async assignDriver(
    orderId: string,
    deliveryPartnerId: string,
    assignedByUserId: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: true,
        customer: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    const driver = await prisma.deliveryPartnerProfile.findUnique({
      where: { id: deliveryPartnerId },
      include: { user: true },
    });

    if (!driver || !driver.isOnline) {
      throw new AppError('Selected delivery partner is offline or not found', HTTP_STATUS.BAD_REQUEST);
    }

    // Distance calculation
    const distanceKm = calculateDistanceKm(
      { latitude: driver.currentLatitude, longitude: driver.currentLongitude },
      { latitude: order.restaurant.latitude, longitude: order.restaurant.longitude }
    );

    const estimatedMinutes = estimateTravelMinutes(distanceKm);

    // Update Order and create DeliveryAssignment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mark any prior assignments as REASSIGNED
      await tx.deliveryAssignment.updateMany({
        where: { orderId, status: 'ASSIGNED' },
        data: { status: 'REASSIGNED' },
      });

      const assignment = await tx.deliveryAssignment.create({
        data: {
          orderId,
          deliveryPartnerId,
          assignedById: assignedByUserId,
          status: 'ASSIGNED',
          distanceKm,
          estimatedMinutes,
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          deliveryPartnerId,
          status: 'DELIVERY_ASSIGNED',
          assignedAt: new Date(),
        },
        include: {
          restaurant: true,
          customer: true,
          items: true,
          deliveryPartner: { include: { user: true } },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'DELIVERY_ASSIGNED',
          notes: `Delivery assigned to partner ${driver.user.name}`,
          changedById: assignedByUserId,
          changedByRole: 'ADMIN',
        },
      });

      // Mark driver as busy/assigned
      await tx.deliveryPartnerProfile.update({
        where: { id: deliveryPartnerId },
        data: { isAvailable: false },
      });

      return { assignment, updatedOrder };
    });

    // Notify Driver
    await NotificationService.send({
      userId: driver.userId,
      title: '🛵 New Delivery Assignment!',
      message: `You have been assigned order #${order.orderNumber} from ${order.restaurant.name}. Tap to accept.`,
      type: 'DELIVERY_ASSIGNED',
      data: { orderId: order.id, orderNumber: order.orderNumber },
    });

    // Notify Customer
    await NotificationService.send({
      userId: order.customerId,
      title: 'Delivery Partner Assigned 🛵',
      message: `${driver.user.name} has been assigned to deliver your order #${order.orderNumber}.`,
      type: 'ORDER_STATUS',
      data: { orderId: order.id, driverName: driver.user.name },
    });

    // Real-Time Socket Broadcasts
    const io = getSocketIoInstance();
    if (io) {
      // Direct alert to Driver Channel
      io.to(`delivery:${deliveryPartnerId}`).emit('delivery:assigned', {
        orderId: order.id,
        deliveryPartnerId,
        orderNumber: order.orderNumber,
        restaurantName: order.restaurant.name,
        customerAddress: order.deliveryAddressSnapshot,
      });

      // Alert Order room
      io.to(`order:${order.id}`).emit('delivery:assigned', {
        orderId: order.id,
        deliveryPartnerId,
        driverName: driver.user.name,
        driverPhone: driver.user.phone,
      });

      // Alert Admin
      io.to('admin:live-orders').emit('order:status-changed', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'DELIVERY_ASSIGNED',
        deliveryPartnerId,
        driverName: driver.user.name,
      });
    }

    await AuditService.log({
      userId: assignedByUserId,
      action: 'DELIVERY_ASSIGNED',
      resource: 'Order',
      resourceId: orderId,
      metadata: { deliveryPartnerId, driverName: driver.user.name },
    });

    return result;
  }

  public static async acceptAssignment(orderId: string, deliveryPartnerId: string, userId: string) {
    const assignment = await prisma.deliveryAssignment.findFirst({
      where: { orderId, deliveryPartnerId, status: 'ASSIGNED' },
    });

    if (!assignment) {
      throw new AppError('No pending delivery assignment found for this order', HTTP_STATUS.NOT_FOUND);
    }

    await prisma.deliveryAssignment.update({
      where: { id: assignment.id },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });

    return OrderService.updateOrderStatus(orderId, 'DELIVERY_ACCEPTED', {
      userId,
      role: 'DELIVERY_PARTNER',
    });
  }

  public static async markArrivedAtRestaurant(orderId: string, userId: string) {
    return OrderService.updateOrderStatus(orderId, 'ARRIVED_AT_RESTAURANT', {
      userId,
      role: 'DELIVERY_PARTNER',
    });
  }

  public static async markFoodPickedUp(orderId: string, userId: string) {
    return OrderService.updateOrderStatus(orderId, 'PICKED_UP', {
      userId,
      role: 'DELIVERY_PARTNER',
    });
  }

  public static async startDelivery(orderId: string, userId: string) {
    return OrderService.updateOrderStatus(orderId, 'ON_THE_WAY', {
      userId,
      role: 'DELIVERY_PARTNER',
    });
  }

  public static async completeDelivery(orderId: string, userId: string) {
    const order = await OrderService.updateOrderStatus(orderId, 'DELIVERED', {
      userId,
      role: 'DELIVERY_PARTNER',
    });

    await prisma.deliveryAssignment.updateMany({
      where: { orderId, status: 'ACCEPTED' },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return order;
  }

  public static async toggleOnlineStatus(deliveryPartnerId: string, isOnline: boolean) {
    const profile = await prisma.deliveryPartnerProfile.update({
      where: { id: deliveryPartnerId },
      data: { isOnline },
    });

    const io = getSocketIoInstance();
    if (io) {
      io.to('admin:live-orders').emit('driver:status-changed', {
        deliveryPartnerId,
        isOnline,
        isAvailable: profile.isAvailable,
      });
    }

    return profile;
  }

  public static async getDriverActiveDelivery(deliveryPartnerId: string) {
    return prisma.order.findFirst({
      where: {
        deliveryPartnerId,
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
        customer: { select: { id: true, name: true, phone: true } },
        items: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        address: true,
      },
    });
  }

  public static async getDriverEarnings(deliveryPartnerId: string) {
    const profile = await prisma.deliveryPartnerProfile.findUnique({
      where: { id: deliveryPartnerId },
    });

    if (!profile) throw new AppError('Driver profile not found', HTTP_STATUS.NOT_FOUND);

    const completedOrders = await prisma.order.findMany({
      where: {
        deliveryPartnerId,
        status: 'DELIVERED',
      },
      select: {
        id: true,
        orderNumber: true,
        deliveryFee: true,
        tipAmount: true,
        deliveredAt: true,
        createdAt: true,
      },
      orderBy: { deliveredAt: 'desc' },
      take: 20,
    });

    return {
      totalEarnings: profile.totalEarnings,
      totalDeliveries: profile.totalDeliveries,
      rating: profile.rating,
      recentDeliveries: completedOrders,
    };
  }
}
