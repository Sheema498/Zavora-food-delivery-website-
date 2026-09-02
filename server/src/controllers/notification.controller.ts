import { Response } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { HTTP_STATUS } from '../constants/index.js';

export class NotificationController {
  public static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { notifications, unreadCount } = await NotificationService.getUserNotifications(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: notifications,
      meta: { unreadCount },
    });
  }

  public static async markRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { id } = req.params;

    await NotificationService.markAsRead(id, userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Notification marked as read',
    });
  }

  public static async markAllRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    await NotificationService.markAllAsRead(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'All notifications marked as read',
    });
  }
}
