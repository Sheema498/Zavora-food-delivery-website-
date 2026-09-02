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
      // Join personal user room
      socket.join(`user:${user.userId}`);

      // Role-specific rooms
      if (user.role === 'ADMIN') {
        socket.join('admin:live-orders');
      }

      if (user.role === 'RESTAURANT' && user.restaurantId) {
        socket.join(`restaurant:${user.restaurantId}`);
      }

      if (user.role === 'DELIVERY_PARTNER' && user.deliveryPartnerId) {
        socket.join(`delivery:${user.deliveryPartnerId}`);
      }
    }

    // Join / Leave specific order tracking room
    socket.on('join:order', ({ orderId }: { orderId: string }) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
      }
    });

    socket.on('leave:order', ({ orderId }: { orderId: string }) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
      }
    });

    // Driver live location streaming
    socket.on(
      'driver:location-update',
      async (data: {
        orderId?: string;
        deliveryPartnerId: string;
        latitude: number;
        longitude: number;
        heading?: number;
        speed?: number;
      }) => {
        try {
          const timestamp = new Date().toISOString();
          const payload = {
            ...data,
            timestamp,
          };

          // Broadcast to order room if associated with an active delivery
          if (data.orderId) {
            io.to(`order:${data.orderId}`).emit('delivery:location-updated', payload);
          }

          // Broadcast to Admin live map
          io.to('admin:live-orders').emit('delivery:location-updated', payload);

          // Update driver coordinates in database
          if (data.deliveryPartnerId) {
            await prisma.deliveryPartnerProfile.update({
              where: { id: data.deliveryPartnerId },
              data: {
                currentLatitude: data.latitude,
                currentLongitude: data.longitude,
                lastLocationUpdate: new Date(),
              },
            });

            // Save history waypoint
            await prisma.deliveryLocationHistory.create({
              data: {
                deliveryPartnerId: data.deliveryPartnerId,
                orderId: data.orderId || null,
                latitude: data.latitude,
                longitude: data.longitude,
                heading: data.heading || 0,
                speed: data.speed || 0,
              },
            });
          }
        } catch (err) {
          console.error('Error handling driver location update:', err);
        }
      }
    );

    // Driver online status toggle via socket
    socket.on(
      'driver:status-toggle',
      async (data: { deliveryPartnerId: string; isOnline: boolean }) => {
        try {
          await prisma.deliveryPartnerProfile.update({
            where: { id: data.deliveryPartnerId },
            data: { isOnline: data.isOnline },
          });

          io.to('admin:live-orders').emit('driver:status-changed', {
            deliveryPartnerId: data.deliveryPartnerId,
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
