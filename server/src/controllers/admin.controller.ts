import { Response } from 'express';
import { AdminService } from '../services/admin.service.js';
import { AuditService } from '../services/audit.service.js';
import { AuthenticatedRequest, Role } from '../types/index.js';
import { HTTP_STATUS } from '../constants/index.js';

export class AdminController {
  public static async getDashboardStats(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const stats = await AdminService.getDashboardStats();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats,
    });
  }

  public static async getLiveOrders(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const liveOrders = await AdminService.getLiveOrders();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: liveOrders,
    });
  }

  public static async listUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { role, page, limit, search } = req.query;
    const result = await AdminService.listUsers(
      role as Role,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      search as string
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.users,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }

  public static async toggleUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await AdminService.toggleUserStatus(userId, isActive, req.user!.userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `User status changed to ${isActive ? 'ACTIVE' : 'SUSPENDED'}`,
      data: user,
    });
  }

  public static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page, limit, action, resource } = req.query;
    const result = await AuditService.getLogs(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      action as string,
      resource as string
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.logs,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }

  public static async broadcastNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { title, message, targetRole } = req.body;
    const result = await AdminService.broadcastNotification(
      { title, message, targetRole },
      req.user!.userId
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Broadcast sent to ${result.count} active users`,
      data: result,
    });
  }
}
