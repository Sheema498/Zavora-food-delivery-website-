import { NotificationType } from '../types/index.js';
import prisma from '../lib/prisma.js';
import { getSocketIoInstance } from '../socket/index.js';

export interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  data?: Record<string, unknown>;
}

export class NotificationService {
  public static async send(params: SendNotificationParams) {
    const dataJson = params.data ? JSON.stringify(params.data) : null;
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || 'ORDER_STATUS',
        dataJson,
      },
    });

    // Broadcast via Socket.IO if connected
    try {
      const io = getSocketIoInstance();
      if (io) {
        io.to(`user:${params.userId}`).emit('notification:new', {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          dataJson: notification.dataJson || undefined,
          createdAt: notification.createdAt.toISOString(),
        });
      }
    } catch (err) {
      console.warn('Socket notification emit skipped:', err);
    }

    return notification;
  }

  public static async getUserNotifications(userId: string, limit = 20) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { notifications, unreadCount };
  }

  public static async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  public static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
