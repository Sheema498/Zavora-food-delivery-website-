import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt.utils.js';
import { AuthUserPayload } from '../types/index.js';
import prisma from '../lib/prisma.js';

let ioInstance: Server | null = null;

export interface AuthenticatedSocket extends Socket {
  user?: AuthUserPayload;
}

export const initSocketServer = (httpServer: HttpServer, clientUrl: string | string[]): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  // Socket Authentication Middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      (socket.handshake.query?.token as string);

    if (token) {
      try {
        const decoded = verifyToken(token);
        socket.user = decoded;
      } catch (err) {
        console.warn('Socket token verification failed, continuing as guest socket:', err);
      }
    }
    next();
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.user;
    if (user) {
      // Join personal user room for direct notifications
      socket.join(`user:${user.userId}`);

      // Role-specific rooms
      if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
        socket.join('admin:dashboard');
        socket.join('admin:live-orders');
      }

      if ((user.role === 'RESTAURANT_MANAGER' || user.role === 'RESTAURANT' || user.role === 'RESTAURANT_ADMIN') && user.restaurantId) {
        socket.join(`restaurant:${user.restaurantId}`);
      }

      const driverId = user.deliveryBoyId || user.deliveryPartnerId;
      if ((user.role === 'DELIVERY_BOY' || user.role === 'DELIVERY_PARTNER') && driverId) {
        socket.join(`delivery:${driverId}`);
      }
    }

    // Join order updates room (status changes)
    socket.on('join:order', async ({ orderId }: { orderId: string }) => {
      if (!orderId) return;

      // Status room for order state transitions
      socket.join(`order:status:${orderId}`);

      // GPS PRIVACY CHECK:
      // Only the Customer who owns this order or the assigned Delivery Boy can join the live GPS tracking room!
      if (!user) return;

      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { deliveryBoy: true },
        });

        if (!order) return;

        const isOwnerCustomer = user.role === 'CUSTOMER' && order.customerId === user.userId;
        const driverId = user.deliveryBoyId || user.deliveryPartnerId;
        const isAssignedDeliveryBoy =
          (user.role === 'DELIVERY_BOY' || user.role === 'DELIVERY_PARTNER') &&
          (order.deliveryBoyId === driverId || order.deliveryBoy?.userId === user.userId);

        if (isOwnerCustomer || isAssignedDeliveryBoy) {
          socket.join(`order:tracking:${orderId}`);
        } else {
          // Explicitly refuse GPS room for Manager, Super Admin, or other users
          // console.info(`GPS access restricted: user ${user.userId} (${user.role}) denied GPS tracking for order ${orderId}`);
        }
      } catch (err) {
        console.error('Error in join:order authorization:', err);
      }
    });

    socket.on('leave:order', ({ orderId }: { orderId: string }) => {
      if (orderId) {
        socket.leave(`order:status:${orderId}`);
        socket.leave(`order:tracking:${orderId}`);
      }
    });

    // Driver live location streaming
    // Restricted: Only the authenticated Delivery Boy assigned to the order can stream coordinates
    socket.on(
      'driver:location-update',
      async (data: {
        orderId?: string;
        deliveryBoyId?: string;
        deliveryPartnerId?: string;
        latitude: number;
        longitude: number;
        heading?: number;
        speed?: number;
      }) => {
        try {
          if (!user) return;

          const isDriverRole = user.role === 'DELIVERY_BOY' || user.role === 'DELIVERY_PARTNER';
          if (!isDriverRole) {
            console.warn(`Unauthorized location update attempted by non-driver role: ${user.role}`);
            return;
          }

          const driverId = data.deliveryBoyId || data.deliveryPartnerId || user.deliveryBoyId || user.deliveryPartnerId;
          if (!driverId) return;

          const timestamp = new Date().toISOString();
          const payload = {
            orderId: data.orderId,
            deliveryBoyId: driverId,
            latitude: data.latitude,
            longitude: data.longitude,
            heading: data.heading || 0,
            speed: data.speed || 0,
            timestamp,
          };

          // Broadcast GPS ONLY to the private tracking room (Customer & Delivery Boy ONLY)
          // Manager and Super Admin MUST NOT receive live GPS updates!
          if (data.orderId) {
            io.to(`order:tracking:${data.orderId}`).emit('delivery:location-updated', payload);
          }

          // Update driver coordinates in database
          await prisma.deliveryBoy.update({
            where: { id: driverId },
            data: {
              currentLatitude: data.latitude,
              currentLongitude: data.longitude,
              lastLocationUpdate: new Date(),
            },
          });

          // Save history waypoint
          await prisma.deliveryLocation.create({
            data: {
              deliveryBoyId: driverId,
              orderId: data.orderId || null,
              latitude: data.latitude,
              longitude: data.longitude,
              heading: data.heading || 0,
              speed: data.speed || 0,
            },
          });
        } catch (err) {
          console.error('Error handling driver location update:', err);
        }
      }
    );

    // Driver online status toggle via socket
    socket.on(
      'driver:status-toggle',
      async (data: { deliveryBoyId?: string; deliveryPartnerId?: string; isOnline: boolean }) => {
        try {
          const driverId = data.deliveryBoyId || data.deliveryPartnerId || user?.deliveryBoyId || user?.deliveryPartnerId;
          if (!driverId) return;

          await prisma.deliveryBoy.update({
            where: { id: driverId },
            data: { isOnline: data.isOnline },
          });

          io.to('admin:dashboard').emit('driver:status-changed', {
            deliveryBoyId: driverId,
            isOnline: data.isOnline,
            isAvailable: true,
          });
        } catch (err) {
          console.error('Error updating driver status via socket:', err);
        }
      }
    );

    socket.on('disconnect', () => {
      // Disconnected cleanly
    });
  });

  ioInstance = io;
  return io;
};

export const getSocketIoInstance = (): Server | null => {
  return ioInstance;
};
