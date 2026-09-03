import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { HTTP_STATUS, ZAVORA_RESTAURANT } from '../constants/index.js';
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
  restaurantId?: string;
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

    // Resolve the single Zavora Restaurant
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      throw new AppError('Zavora restaurant profile not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const [customer, address] = await Promise.all([
      prisma.user.findUnique({ where: { id: customerId } }),
      prisma.address.findFirst({ where: { id: dto.addressId, userId: customerId } }),
    ]);

    if (!customer) throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND);
    if (!address) throw new AppError('Delivery address not found', HTTP_STATUS.NOT_FOUND);
    if (!restaurant.isOpen) {
      throw new AppError('Zavora restaurant is currently closed and not accepting orders', HTTP_STATUS.BAD_REQUEST);
    }

    // Fetch food items from Zavora database
    const itemIds = dto.items.map((i) => i.foodItemId);
    const dbFoodItems = await prisma.foodItem.findMany({
      where: {
        id: { in: itemIds },
        restaurantId: restaurant.id,
      },
    });

    if (dbFoodItems.length !== dto.items.length) {
      throw new AppError('One or more items do not belong to Zavora restaurant', HTTP_STATUS.BAD_REQUEST);
    }

    for (const dbItem of dbFoodItems) {
      if (!dbItem.isAvailable) {
        throw new AppError(`Item "${dbItem.name}" is currently out of stock`, HTTP_STATUS.BAD_REQUEST);
      }
    }

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
    const orderNumber = generateOrderNumber(); // Generates ZV-XXXX

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          restaurantId: restaurant.id,
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

    // In-app Notification to Customer
    await NotificationService.send({
      userId: customerId,
      title: 'Order Placed Successfully! 🎉',
      message: `Your order #${order.orderNumber} has been received by Zavora Restaurant for ₹${order.totalAmount}.`,
      type: 'ORDER_STATUS',
      data: { orderId: order.id, orderNumber: order.orderNumber },
    });

    // Notify Restaurant Manager
    const managers = await prisma.restaurantManager.findMany({
      where: { restaurantId: restaurant.id },
      select: { userId: true },
    });

    for (const mgr of managers) {
      await NotificationService.send({
        userId: mgr.userId,
        title: '🔔 New Incoming Order!',
        message: `Order #${order.orderNumber} received for ₹${order.totalAmount}. Please accept and begin preparation.`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, orderNumber: order.orderNumber },
      });
    }

    // Socket.IO Real-Time Broadcasts
    const io = getSocketIoInstance();
    if (io) {
      // Alert Restaurant Manager
      io.to(`restaurant:${restaurant.id}`).emit('order:created', {
        orderId: order.id,
        restaurantId: restaurant.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      });

      // Alert Admin Dashboard (metrics update)
      io.to('admin:dashboard').emit('order:created', {
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
        deliveryBoy: {
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
      if (requestingUser.role === 'CUSTOMER' && order.customerId !== requestingUser.userId) {
        throw new AppError('Unauthorized access to this order', HTTP_STATUS.FORBIDDEN);
      }
      if (
        (requestingUser.role === 'DELIVERY_BOY' || requestingUser.role === 'DELIVERY_PARTNER') &&
        order.deliveryBoyId &&
        order.deliveryBoy?.userId !== requestingUser.userId
        (requestingUser.role === 'RESTAURANT' || requestingUser.role === 'RESTAURANT_ADMIN') &&
        (requestingUser as any).restaurantId &&
        order.restaurantId !== (requestingUser as any).restaurantId
      ) {
        throw new AppError('Unauthorized access: Restaurant can only access its own orders', HTTP_STATUS.FORBIDDEN);
      }
      if (
        requestingUser.role === 'DELIVERY_PARTNER' &&
        order.deliveryPartnerId &&
        order.deliveryPartner?.userId !== requestingUser.userId
      ) {
        throw new AppError('Unauthorized access to this order', HTTP_STATUS.FORBIDDEN);
      }
    }

    // GPS PRIVACY RESTRICTION:
    // Manager and Super Admin MUST NOT see live GPS coordinates!
    // Scrub live coordinates if the viewer is Manager or Super Admin.
    if (requestingUser && (
      requestingUser.role === 'RESTAURANT_MANAGER' ||
      requestingUser.role === 'RESTAURANT' ||
      requestingUser.role === 'SUPER_ADMIN' ||
      requestingUser.role === 'ADMIN'
    )) {
      if (order.deliveryBoy) {
        // Obfuscate coordinates for Manager and Admin to strictly uphold GPS privacy
        (order.deliveryBoy as any).currentLatitude = null;
        (order.deliveryBoy as any).currentLongitude = null;
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
          deliveryBoy: {
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
          deliveryBoy: {
            include: {
              user: { select: { name: true, phone: true } },
            },
          },
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Strip live GPS coordinates from delivery boy for Manager
    const sanitizedOrders = orders.map((o) => {
      if (o.deliveryBoy) {
        return {
          ...o,
          deliveryBoy: {
            ...o.deliveryBoy,
            currentLatitude: null,
            currentLongitude: null,
          },
        };
      }
      return o;
    });

    return { orders: sanitizedOrders, total, page, limit, totalPages: Math.ceil(total / limit) };
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
        deliveryBoy: {
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
    if (!allowedForRole || !allowedForRole.includes(targetStatus)) {
      throw new AppError(
        `Role ${actor.role} is not permitted to perform transition to ${targetStatus}`,
        HTTP_STATUS.FORBIDDEN
      );
    }

    // State machine transition validation
    const validNextStates = VALID_ORDER_TRANSITIONS[currentStatus];
    const isSuperAdmin = actor.role === 'SUPER_ADMIN' || actor.role === 'ADMIN';
    if (!isSuperAdmin && !validNextStates.includes(targetStatus)) {
      throw new AppError(
        `Invalid order state transition from ${currentStatus} to ${targetStatus}. Valid next states: [${validNextStates.join(', ')}]`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

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

      // Update Delivery Boy stats
      if (order.deliveryBoyId) {
        await prisma.deliveryBoy.update({
          where: { id: order.deliveryBoyId },
          data: {
            isAvailable: true,
            totalDeliveries: { increment: 1 },
            totalEarnings: { increment: 45.0 }, // Base delivery payout
          },
        });
      }

      // Update Restaurant revenue
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
          deliveryBoy: { include: { user: true } },
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

  // Assign the ONE Zavora Delivery Boy
  public static async assignZavoraDeliveryBoy(orderId: string, assignedByUserId: string) {
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

    // Find the single Zavora delivery boy
    const deliveryBoy = await prisma.deliveryBoy.findFirst({
      where: { restaurantId: order.restaurantId },
      include: { user: true },
    });

    if (!deliveryBoy) {
      throw new AppError('No active Delivery Boy found for Zavora Restaurant', HTTP_STATUS.BAD_REQUEST);
    }

    const distanceKm = calculateDistanceKm(
      { latitude: deliveryBoy.currentLatitude, longitude: deliveryBoy.currentLongitude },
      { latitude: order.restaurant.latitude, longitude: order.restaurant.longitude }
    );
    const estimatedMinutes = estimateTravelMinutes(distanceKm);

    const result = await prisma.$transaction(async (tx) => {
      // Mark any prior assignments as REASSIGNED
      await tx.deliveryAssignment.updateMany({
        where: { orderId, status: 'ASSIGNED' },
        data: { status: 'REASSIGNED' },
      });

      const assignment = await tx.deliveryAssignment.create({
        data: {
          orderId,
          deliveryBoyId: deliveryBoy.id,
          assignedById: assignedByUserId,
          status: 'ASSIGNED',
          distanceKm,
          estimatedMinutes,
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          deliveryBoyId: deliveryBoy.id,
          status: 'DELIVERY_ASSIGNED',
          assignedAt: new Date(),
        },
        include: {
          restaurant: true,
          customer: true,
          items: true,
          deliveryBoy: { include: { user: true } },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'DELIVERY_ASSIGNED',
          notes: `Delivery assigned to Zavora courier ${deliveryBoy.user.name}`,
          changedById: assignedByUserId,
          changedByRole: 'RESTAURANT_MANAGER',
        },
      });

      // Mark driver as occupied
      await tx.deliveryBoy.update({
        where: { id: deliveryBoy.id },
        data: { isAvailable: false },
      });

      return { assignment, updatedOrder };
    });

    // Notify Driver
    await NotificationService.send({
      userId: deliveryBoy.userId,
      title: '🛵 New Delivery Assigned!',
      message: `You have been assigned order #${order.orderNumber} from Zavora. Tap to accept.`,
      type: 'DELIVERY_ASSIGNED',
      data: { orderId: order.id, orderNumber: order.orderNumber },
    });

    // Notify Customer
    await NotificationService.send({
      userId: order.customerId,
      title: 'Delivery Partner Assigned 🛵',
      message: `${deliveryBoy.user.name} has been assigned to deliver your order #${order.orderNumber}.`,
      type: 'ORDER_STATUS',
      data: { orderId: order.id, driverName: deliveryBoy.user.name },
    });

    // Real-Time Socket Broadcasts
    const io = getSocketIoInstance();
    if (io) {
      // Alert Driver Channel
      io.to(`delivery:${deliveryBoy.id}`).emit('delivery:assigned', {
        orderId: order.id,
        deliveryBoyId: deliveryBoy.id,
        orderNumber: order.orderNumber,
        restaurantName: order.restaurant.name,
        customerAddress: order.deliveryAddressSnapshot,
      });

      // Alert Order room (customer)
      io.to(`order:status:${order.id}`).emit('delivery:assigned', {
        orderId: order.id,
        deliveryBoyId: deliveryBoy.id,
        driverName: deliveryBoy.user.name,
        driverPhone: deliveryBoy.user.phone,
      });

      // Alert Manager Channel
      io.to(`restaurant:${order.restaurantId}`).emit('order:status-changed', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'DELIVERY_ASSIGNED',
        deliveryBoyId: deliveryBoy.id,
        driverName: deliveryBoy.user.name,
      });

      // Alert Admin
      io.to('admin:dashboard').emit('order:status-changed', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'DELIVERY_ASSIGNED',
        deliveryBoyId: deliveryBoy.id,
        driverName: deliveryBoy.user.name,
      });
    }

    return result.updatedOrder;
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
        message: `Order #${orderNum} is ready for pickup at Zavora. Dispatching delivery partner.`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, status },
      });
    } else if (status === 'DELIVERY_ACCEPTED') {
      await NotificationService.send({
        userId: customerId,
        title: 'Courier Accepted Delivery 🛵',
        message: `Your courier has accepted the delivery and is on the way to Zavora.`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, status },
      });
    } else if (status === 'ARRIVED_AT_RESTAURANT') {
      await NotificationService.send({
        userId: customerId,
        title: 'Courier Arrived at Zavora 📍',
        message: `Your delivery partner has arrived at Zavora Restaurant to pick up your food.`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, status },
      });
    } else if (status === 'PICKED_UP') {
      await NotificationService.send({
        userId: customerId,
        title: 'Food Picked Up! 🛍️',
        message: `Your food has been picked up from Zavora and is being secured for delivery.`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, status },
      });
    } else if (status === 'ON_THE_WAY') {
      await NotificationService.send({
        userId: customerId,
        title: 'Order is On The Way! 🚀',
        message: `Your courier is en route to your address. Live GPS tracking is active.`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, status },
      });
    } else if (status === 'DELIVERED') {
      // Final delivery notification to:
      // 1. Customer
      await NotificationService.send({
        userId: customerId,
        title: 'Order Delivered! 🎉 Enjoy your meal',
        message: `Order #${orderNum} has been delivered successfully. Thank you for choosing Zavora!`,
        type: 'ORDER_STATUS',
        data: { orderId: order.id, status },
      });

      // 2. Restaurant Manager
      const managers = await prisma.restaurantManager.findMany({
        where: { restaurantId: order.restaurantId },
        select: { userId: true },
      });
      for (const mgr of managers) {
        await NotificationService.send({
          userId: mgr.userId,
          title: 'Order Delivered Successfully ✅',
          message: `Order #${orderNum} has been delivered to customer ${order.customer.name}.`,
          type: 'ORDER_STATUS',
          data: { orderId: order.id, status },
        });
      }

      // 3. Delivery Boy
      if (order.deliveryBoy?.userId) {
        await NotificationService.send({
          userId: order.deliveryBoy.userId,
          title: 'Delivery Mission Completed! 💰',
          message: `Order #${orderNum} delivered successfully. ₹45 credited to your earnings.`,
          type: 'ORDER_STATUS',
          data: { orderId: order.id, status },
        });
      }
    } else if (status === 'RESTAURANT_REJECTED') {
      await NotificationService.send({
        userId: customerId,
        title: 'Order Declined by Restaurant',
        message: `Sorry, Zavora could not fulfill order #${orderNum}: ${order.rejectionReason}`,
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

    // Emit to order status room (for customer live page)
    io.to(`order:status:${order.id}`).emit(`order:${status.toLowerCase()}`, baseData);
    io.to(`order:status:${order.id}`).emit('order:status-changed', baseData);

    // Emit to Manager channel
    io.to(`restaurant:${order.restaurantId}`).emit('order:status-changed', baseData);
    io.to(`restaurant:${order.restaurantId}`).emit(`order:${status.toLowerCase()}`, baseData);

    // Emit to Admin Dashboard channel (NO GPS)
    io.to('admin:dashboard').emit('order:status-changed', baseData);

    // Specific dispatches
    if (status === 'DELIVERED') {
      if (order.deliveryBoyId) {
        io.to(`delivery:${order.deliveryBoyId}`).emit('order:delivered', {
          orderId: order.id,
          deliveredAt: new Date().toISOString(),
        });
      }
    }
  }
}
