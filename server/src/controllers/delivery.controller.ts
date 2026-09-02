import { Response } from 'express';
import { DeliveryService } from '../services/delivery.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../middleware/error.middleware.js';

export class DeliveryController {
  public static async getAvailableDrivers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { lat, lng } = req.query;
    const drivers = await DeliveryService.getAvailableDeliveryPartners(
      lat ? Number(lat) : undefined,
      lng ? Number(lng) : undefined
    );
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: drivers,
    });
  }

  public static async assignDriver(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId, deliveryPartnerId } = req.body;
    const assignedByUserId = req.user!.userId;

    const result = await DeliveryService.assignDriver(orderId, deliveryPartnerId, assignedByUserId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Delivery partner assigned successfully',
      data: result,
    });
  }

  public static async acceptAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId } = req.params;
    const deliveryPartnerId = req.user?.deliveryPartnerId;
    if (!deliveryPartnerId) {
      throw new AppError('Delivery Partner profile not found for this account', HTTP_STATUS.BAD_REQUEST);
    }

    const order = await DeliveryService.acceptAssignment(orderId, deliveryPartnerId, req.user!.userId);
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
      message: 'Marked as arrived at restaurant',
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
      message: 'Delivery started (on the way)',
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
    const deliveryPartnerId = req.user?.deliveryPartnerId;
    if (!deliveryPartnerId) {
      throw new AppError('Delivery Partner profile not found', HTTP_STATUS.BAD_REQUEST);
    }

    const { isOnline } = req.body;
    const profile = await DeliveryService.toggleOnlineStatus(deliveryPartnerId, isOnline);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Status updated: You are now ${isOnline ? 'ONLINE' : 'OFFLINE'}`,
      data: profile,
    });
  }

  public static async getActiveDelivery(req: AuthenticatedRequest, res: Response): Promise<void> {
    const deliveryPartnerId = req.user?.deliveryPartnerId;
    if (!deliveryPartnerId) {
      throw new AppError('Delivery Partner profile not found', HTTP_STATUS.BAD_REQUEST);
    }

    const activeOrder = await DeliveryService.getDriverActiveDelivery(deliveryPartnerId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: activeOrder,
    });
  }

  public static async getEarnings(req: AuthenticatedRequest, res: Response): Promise<void> {
    const deliveryPartnerId = req.user?.deliveryPartnerId;
    if (!deliveryPartnerId) {
      throw new AppError('Delivery Partner profile not found', HTTP_STATUS.BAD_REQUEST);
    }

    const earnings = await DeliveryService.getDriverEarnings(deliveryPartnerId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: earnings,
    });
  }
}
