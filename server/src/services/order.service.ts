import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { HTTP_STATUS } from '../constants/index.js';
import { generateOrderNumber } from '../utils/orderNumber.utils.js';
import { calculateOrderPriceBreakdown } from '../utils/price.utils.js';
import { calculateDistanceKm, estimateTravelMinutes } from '../utils/geo.utils.js';
import { VALID_ORDER_TRANSITIONS, ROLE_ALLOWED_STATUS_TRANSITIONS, OrderStatus, Role } from '../types/index.js';
import { NotificationService } from './notification.service.js';
import { PaymentService } from './payment.service.js';
import { CouponService } from './coupon.service.js';
import { AuditService } from './audit.service.js';
import { getSocketIoInstance } from '../socket/index.js';

export interface CreateOrderDto {
  restaurantId: string;
  addressId: string;
  items: Array<{
    foodItemId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  paymentMethod: 'CASH_ON_DELIVERY' | 'ONLINE_DEMO_PAY';
  couponCode?: string;
  tipAmount?: number;
  customerNotes?: string;
}

export class OrderService {
  public static async createOrder(
    customerId: string,
    dto: CreateOrderDto,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (!dto.items || dto.items.length === 0) {
      throw new AppError('Cart cannot be empty when placing an order', HTTP_STATUS.BAD_REQUEST);
    }

    const [customer, restaurant, address] = await Promise.all([
      prisma.user.findUnique({ where: { id: customerId } }),
      prisma.restaurant.findUnique({ where: { id: dto.restaurantId } }),
      prisma.address.findFirst({ where: { id: dto.addressId, userId: customerId } }),
    ]);

    if (!customer) throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND);
    if (!restaurant) throw new AppError('Restaurant not found', HTTP_STATUS.NOT_FOUND);
    if (!restaurant.isOpen) {
      throw new AppError('This restaurant is currently closed and not accepting orders', HTTP_STATUS.BAD_REQUEST);
    }
    if (!address) throw new AppError('Delivery address not found', HTTP_STATUS.NOT_FOUND);

    // Fetch food items to verify availability and prices
    const itemIds = dto.items.map((i) => i.foodItemId);
    const dbFoodItems = await prisma.foodItem.findMany({
      where: {
        id: { in: itemIds },
        restaurantId: dto.restaurantId,
      },
    });

    if (dbFoodItems.length !== dto.items.length) {
      throw new AppError('One or more items do not belong to this restaurant', HTTP_STATUS.BAD_REQUEST);
    }

    // Verify all items are available
    for (const dbItem of dbFoodItems) {
      if (!dbItem.isAvailable) {
        throw new AppError(`Item "${dbItem.name}" is currently out of stock`, HTTP_STATUS.BAD_REQUEST);
      }
    }

    // Calculate distance and pricing
    const distanceKm = calculateDistanceKm(
      { latitude: restaurant.latitude, longitude: restaurant.longitude },
      { latitude: address.latitude, longitude: address.longitude }
    );

    const pricingItems = dto.items.map((item) => {
      const dbItem = dbFoodItems.find((f) => f.id === item.foodItemId)!;
      const price = dbItem.discountPrice || dbItem.price;
      return {
        unitPrice: price,
        quantity: item.quantity,
      };
    });

    const subtotal = pricingItems.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);

    if (subtotal < restaurant.minOrderAmount) {
      throw new AppError(
        `Minimum order amount for ${restaurant.name} is ₹${restaurant.minOrderAmount}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    let couponDiscount = 0;
    if (dto.couponCode) {
      const couponRes = await CouponService.validateCoupon(dto.couponCode, subtotal);
      couponDiscount = couponRes.discountAmount;
      // Increment coupon usage
      await prisma.coupon.update({
        where: { code: dto.couponCode.toUpperCase().trim() },
        data: { usedCount: { increment: 1 } },
      });
    }

    const priceBreakdown = calculateOrderPriceBreakdown(
      pricingItems,
      distanceKm,
      couponDiscount,
      dto.tipAmount || 0
    );

    const estimatedDeliveryMinutes = estimateTravelMinutes(distanceKm, restaurant.avgPrepTimeMinutes);
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          restaurantId: dto.restaurantId,
          addressId: dto.addressId,
          status: 'PENDING',
          subtotal: priceBreakdown.subtotal,
          taxAmount: priceBreakdown.taxAmount,
          deliveryFee: priceBreakdown.deliveryFee,
          discountAmount: priceBreakdown.discountAmount,
          tipAmount: priceBreakdown.tipAmount,
          totalAmount: priceBreakdown.totalAmount,
          paymentMethod: dto.paymentMethod,
          paymentStatus: dto.paymentMethod === 'ONLINE_DEMO_PAY' ? 'PAID' : 'PENDING',
          deliveryAddressSnapshot: JSON.stringify({
            label: address.label,
            recipientName: address.recipientName || customer.name,
            phone: address.phone || customer.phone,
            streetAddress: address.streetAddress,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            latitude: address.latitude,
            longitude: address.longitude,
          }),
          customerNotes: dto.customerNotes || null,
          estimatedPrepMinutes: restaurant.avgPrepTimeMinutes,
          estimatedDeliveryMinutes,
          items: {
            create: dto.items.map((item) => {
              const dbItem = dbFoodItems.find((f) => f.id === item.foodItemId)!;
              const price = dbItem.discountPrice || dbItem.price;
              return {
                foodItemId: item.foodItemId,
                name: dbItem.name,
                quantity: item.quantity,
                unitPrice: price,
                totalPrice: Math.round(price * item.quantity * 100) / 100,
                specialInstructions: item.specialInstructions || null,
              };
            }),
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              notes: 'Order placed by customer',
              changedById: customerId,
              changedByRole: 'CUSTOMER',
            },
          },
        },
        include: {
          items: true,
          restaurant: true,
          customer: {
            select: { id: true, name: true, phone: true, email: true },
          },
          address: true,
        },
      });

      // Clear customer's cart
      const cart = await tx.cart.findUnique({ where: { userId: customerId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.cart.update({ where: { id: cart.id }, data: { restaurantId: null } });
      }

      return newOrder;
    });

    // Create payment record
    await PaymentService.processPayment(
      order.id,
      customerId,
      priceBreakdown.totalAmount,
      dto.paymentMethod
    );

    // In-app Notifications
    await Promise.all([
      NotificationService.send({
        userId: customerId,
        title: 'Order Placed Successfully! 🎉',
        message: `Your order #${order.orderNumber} at ${restaurant.name} has been placed for ₹${order.totalAmount}.`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, orderNumber: order.orderNumber },
      }),
    ]);

    // Notify Restaurant Staff
    const staffMembers = await prisma.restaurantStaff.findMany({
      where: { restaurantId: restaurant.id },
      select: { userId: true },
    });

    for (const staff of staffMembers) {
      await NotificationService.send({
        userId: staff.userId,
        title: '🔔 New Incoming Order!',
        message: `Order #${order.orderNumber} received for ₹${order.totalAmount}. Please accept and begin preparation.`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, orderNumber: order.orderNumber },
      });
    }

    // Socket.IO Real-Time Broadcasts
    const io = getSocketIoInstance();
    if (io) {
      // Alert Restaurant Channel
      io.to(`restaurant:${restaurant.id}`).emit('order:created', {
        orderId: order.id,
        restaurantId: restaurant.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      });

      // Alert Admin Operations Feed
      io.to('admin:live-orders').emit('order:created', {
        orderId: order.id,
        restaurantId: restaurant.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      });
    }

    await AuditService.log({
      userId: customerId,
      action: 'ORDER_CREATED',
      resource: 'Order',
      resourceId: order.id,
      ipAddress,
      userAgent,
      metadata: { orderNumber: order.orderNumber, totalAmount: order.totalAmount },
    });

    return order;
  }

  public static async getOrderById(orderId: string, requestingUser?: { userId: string; role: Role }) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            foodItem: true,
          },
        },
        restaurant: true,
        customer: {
          select: { id: true, name: true, phone: true, email: true, avatarUrl: true },
        },
        address: true,
        deliveryPartner: {
          include: {
            user: {
              select: { id: true, name: true, phone: true, avatarUrl: true },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        payments: true,
        review: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    // Authorization check
    if (requestingUser) {
      if (
        requestingUser.role === 'CUSTOMER' &&
        order.customerId !== requestingUser.userId
      ) {
        throw new AppError('Unauthorized access to this order', HTTP_STATUS.FORBIDDEN);
      }
      if (
        requestingUser.role === 'DELIVERY_PARTNER' &&
        order.deliveryPartnerId &&
        order.deliveryPartner?.userId !== requestingUser.userId
      ) {
        throw new AppError('Unauthorized access to this order', HTTP_STATUS.FORBIDDEN);
      }
    }

    return order;
  }

  public static async listCustomerOrders(customerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          restaurant: {
            select: { id: true, name: true, slug: true, logoUrl: true, address: true },
          },
          items: true,
          deliveryPartner: {
            include: {
              user: { select: { name: true, phone: true } },
            },
          },
          review: true,
        },
      }),
      prisma.order.count({ where: { customerId } }),
    ]);

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  public static async listRestaurantOrders(
    restaurantId: string,
    statusFilter?: string,
    page = 1,
    limit = 25
  ) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { restaurantId };

    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          customer: { select: { id: true, name: true, phone: true } },
          deliveryPartner: {
            include: {
              user: { select: { name: true, phone: true } },
            },
          },
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  public static async updateOrderStatus(
    orderId: string,
    targetStatus: OrderStatus,
    actor: { userId: string; role: Role; name?: string },
    options?: {
      rejectionReason?: string;
      cancellationReason?: string;
      estimatedPrepMinutes?: number;
      restaurantNotes?: string;
    }
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: true,
        customer: true,
        deliveryPartner: {
          include: { user: true },
        },
      },
    });

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    const currentStatus = order.status as OrderStatus;

    // Role Permission check
    const allowedForRole = ROLE_ALLOWED_STATUS_TRANSITIONS[actor.role];
    if (!allowedForRole.includes(targetStatus)) {
      throw new AppError(
        `Role ${actor.role} is not permitted to perform transition to ${targetStatus}`,
        HTTP_STATUS.FORBIDDEN
      );
    }

    // State machine transition validation
    const validNextStates = VALID_ORDER_TRANSITIONS[currentStatus];
    if (actor.role !== 'ADMIN' && !validNextStates.includes(targetStatus)) {
      throw new AppError(
        `Invalid order state transition from ${currentStatus} to ${targetStatus}. Valid next states: [${validNextStates.join(', ')}]`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Update timestamps and details
    const updateData: Record<string, unknown> = {
      status: targetStatus,
    };

    if (targetStatus === 'RESTAURANT_ACCEPTED') {
      updateData.acceptedAt = new Date();
      if (options?.estimatedPrepMinutes) {
        updateData.estimatedPrepMinutes = options.estimatedPrepMinutes;
      }
    } else if (targetStatus === 'READY_FOR_PICKUP') {
      updateData.readyAt = new Date();
    } else if (targetStatus === 'PICKED_UP') {
      updateData.pickedUpAt = new Date();
    } else if (targetStatus === 'DELIVERED') {
      updateData.deliveredAt = new Date();
      updateData.paymentStatus = 'PAID';
      // Mark delivery partner as available
      if (order.deliveryPartnerId) {
        await prisma.deliveryPartnerProfile.update({
          where: { id: order.deliveryPartnerId },
          data: {
            isAvailable: true,
            totalDeliveries: { increment: 1 },
            totalEarnings: { increment: 45.0 }, // Base delivery payout
          },
        });
      }
      // Update restaurant revenue
      await prisma.restaurant.update({
        where: { id: order.restaurantId },
        data: {
          totalRevenue: { increment: order.totalAmount },
        },
      });
    } else if (targetStatus === 'RESTAURANT_REJECTED') {
      updateData.rejectionReason = options?.rejectionReason || 'Restaurant unable to fulfill at this moment';
      updateData.cancelledAt = new Date();
      if (order.paymentStatus === 'PAID') {
        await PaymentService.refundPayment(orderId, updateData.rejectionReason as string);
      }
    } else if (targetStatus === 'CANCELLED') {
      updateData.cancellationReason = options?.cancellationReason || 'Order cancelled';
      updateData.cancelledAt = new Date();
      if (order.paymentStatus === 'PAID') {
        await PaymentService.refundPayment(orderId, updateData.cancellationReason as string);
      }
    }

    if (options?.restaurantNotes) {
      updateData.restaurantNotes = options.restaurantNotes;
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          items: true,
          restaurant: true,
          customer: true,
          deliveryPartner: { include: { user: true } },
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: targetStatus,
          notes: options?.rejectionReason || options?.cancellationReason || `Status changed to ${targetStatus}`,
          changedById: actor.userId,
          changedByRole: actor.role,
        },
      });

      return ord;
    });

    // Send notifications based on new status
    await this.dispatchStatusNotifications(updatedOrder, targetStatus);

    // Emit Socket.IO Events
    this.dispatchStatusSocketEvents(updatedOrder, targetStatus);

    await AuditService.log({
      userId: actor.userId,
      action: 'ORDER_STATUS_UPDATED',
      resource: 'Order',
      resourceId: orderId,
      metadata: { from: currentStatus, to: targetStatus, actorRole: actor.role },
    });

    return updatedOrder;
  }

  private static async dispatchStatusNotifications(order: any, status: OrderStatus) {
    const customerId = order.customerId;
    const restName = order.restaurant.name;
    const orderNum = order.orderNumber;

    if (status === 'RESTAURANT_ACCEPTED') {
      await NotificationService.send({
        userId: customerId,
        title: 'Order Accepted! 🍳',
        message: `${restName} accepted order #${orderNum}. Prep time ~${order.estimatedPrepMinutes} mins.`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, status },
      });
    } else if (status === 'PREPARING') {
      await NotificationService.send({
        userId: customerId,
        title: 'Food is being Prepared 👨‍🍳',
        message: `${restName} is currently cooking your food fresh.`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, status },
      });
    } else if (status === 'READY_FOR_PICKUP') {
      await NotificationService.send({
        userId: customerId,
        title: 'Food is Packed & Ready 📦',
        message: `Order #${orderNum} is ready for pickup at ${restName}. Dispatching delivery partner.`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, status },
      });
    } else if (status === 'DELIVERED') {
      await NotificationService.send({
        userId: customerId,
        title: 'Order Delivered! 🍕 Enjoy your meal',
        message: `Your order #${orderNum} has been delivered. Please share your rating & review!`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, status },
      });
    } else if (status === 'RESTAURANT_REJECTED') {
      await NotificationService.send({
        userId: customerId,
        title: 'Order Declined by Restaurant',
        message: `Sorry, ${restName} could not fulfill order #${orderNum}: ${order.rejectionReason}`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, status },
      });
    }
  }

  private static dispatchStatusSocketEvents(order: any, status: OrderStatus) {
    const io = getSocketIoInstance();
    if (!io) return;

    const baseData = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status,
      restaurantName: order.restaurant.name,
      updatedAt: new Date().toISOString(),
    };

    // Emit to order room (customer, driver, admin)
    io.to(`order:${order.id}`).emit(`order:${status.toLowerCase()}`, baseData);
    io.to(`order:${order.id}`).emit('order:status-changed', baseData);

    // Emit to Admin Live Orders channel
    io.to('admin:live-orders').emit('order:status-changed', baseData);
    io.to('admin:live-orders').emit(`order:${status.toLowerCase()}`, baseData);

    // Specific event dispatches
    if (status === 'READY_FOR_PICKUP') {
      io.to('admin:live-orders').emit('order:ready', {
        orderId: order.id,
        restaurantName: order.restaurant.name,
        restaurantId: order.restaurantId,
      });
    } else if (status === 'DELIVERED') {
      io.to(`restaurant:${order.restaurantId}`).emit('order:delivered', {
        orderId: order.id,
        deliveredAt: new Date().toISOString(),
      });
    }
  }
}
