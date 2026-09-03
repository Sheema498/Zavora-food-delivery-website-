import { Response } from 'express';
import { DeliveryService } from '../services/delivery.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../middleware/error.middleware.js';

export class DeliveryController {
  public static async getAvailableDrivers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const drivers = await DeliveryService.getAvailableDeliveryPartners();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: drivers,
    });
  }

  public static async assignDriver(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId, deliveryBoyId, deliveryPartnerId } = req.body;
    const assignedByUserId = req.user!.userId;
    const driverId = deliveryBoyId || deliveryPartnerId || '';

    const result = await DeliveryService.assignDriver(orderId, driverId, assignedByUserId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Delivery boy assigned successfully',
      data: result,
    });
  }

  public static async acceptAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId } = req.params;
    const deliveryBoyId = req.user?.deliveryBoyId || req.user?.deliveryPartnerId;
    if (!deliveryBoyId) {
      throw new AppError('Delivery Boy profile not found for this account', HTTP_STATUS.BAD_REQUEST);
    }

    const order = await DeliveryService.acceptAssignment(orderId, deliveryBoyId, req.user!.userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Assignment accepted',
      data: order,
    });
  }

  public static async markArrived(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId } = req.params;
    const order = await DeliveryService.markArrivedAtRestaurant(orderId, req.user!.userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Marked as arrived at Zavora Restaurant',
      data: order,
    });
  }

  public static async markPickedUp(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId } = req.params;
    const order = await DeliveryService.markFoodPickedUp(orderId, req.user!.userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Marked food picked up',
      data: order,
    });
  }

  public static async startDelivery(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId } = req.params;
    const order = await DeliveryService.startDelivery(orderId, req.user!.userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Delivery started (live GPS active)',
      data: order,
    });
  }

  public static async completeDelivery(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId } = req.params;
    const order = await DeliveryService.completeDelivery(orderId, req.user!.userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Order successfully delivered',
      data: order,
    });
  }

  public static async toggleOnline(req: AuthenticatedRequest, res: Response): Promise<void> {
    const deliveryBoyId = req.user?.deliveryBoyId || req.user?.deliveryPartnerId;
    if (!deliveryBoyId) {
      throw new AppError('Delivery partner profile not found', HTTP_STATUS.BAD_REQUEST);
    }

    const { isOnline } = req.body;
    const profile = await DeliveryService.toggleOnlineStatus(deliveryBoyId, isOnline);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Status updated: You are now ${isOnline ? 'ONLINE' : 'OFFLINE'}`,
      data: profile,
    });
  }

  public static async getActiveDelivery(req: AuthenticatedRequest, res: Response): Promise<void> {
    const deliveryBoyId = req.user?.deliveryBoyId || req.user?.deliveryPartnerId;
    if (!deliveryBoyId) {
      throw new AppError('Delivery partner profile not found', HTTP_STATUS.BAD_REQUEST);
    }

    const activeOrder = await DeliveryService.getActiveDelivery(deliveryBoyId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: activeOrder,
    });
  }

  public static async getEarnings(req: AuthenticatedRequest, res: Response): Promise<void> {
    const deliveryBoyId = req.user?.deliveryBoyId || req.user?.deliveryPartnerId;
    if (!deliveryBoyId) {
      throw new AppError('Delivery partner profile not found', HTTP_STATUS.BAD_REQUEST);
    }

    const earnings = await DeliveryService.getEarnings(deliveryBoyId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: earnings,
    });
  }

  public static async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const deliveryBoyId = req.user?.deliveryBoyId || req.user?.deliveryPartnerId;
    if (!deliveryBoyId) {
      throw new AppError('Delivery partner profile not found', HTTP_STATUS.BAD_REQUEST);
    }

    const { page, limit } = req.query;
    const history = await DeliveryService.getDeliveryHistory(
      deliveryBoyId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: history.orders,
      meta: {
        page: history.page,
        limit: history.limit,
        total: history.total,
        totalPages: history.totalPages,
      },
    });
  }
}
