import { Response } from 'express';
import { OrderService } from '../services/order.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { HTTP_STATUS } from '../constants/index.js';

export class OrderController {
  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const customerId = req.user!.userId;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const order = await OrderService.createOrder(customerId, req.body, ipAddress, userAgent);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  }

  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const order = await OrderService.getOrderById(id, req.user);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: order,
    });
  }

  public static async getCustomerOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const customerId = req.user!.userId;
    const { page, limit } = req.query;

    const result = await OrderService.listCustomerOrders(
      customerId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.orders,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }

  public static async getRestaurantOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const restaurantId = req.user?.restaurantId || (req.query.restaurantId as string) || '';
    const { status, page, limit } = req.query;

    const result = await OrderService.listRestaurantOrders(
      restaurantId,
      status as string,
      page ? Number(page) : 1,
      limit ? Number(limit) : 25
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.orders,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }

  public static async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, rejectionReason, cancellationReason, estimatedPrepMinutes, restaurantNotes } =
      req.body;

    const updatedOrder = await OrderService.updateOrderStatus(
      id,
      status,
      {
        userId: req.user!.userId,
        role: req.user!.role,
        name: req.user!.name,
      },
      {
        rejectionReason,
        cancellationReason,
        estimatedPrepMinutes,
        restaurantNotes,
      }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  }

  public static async assignDeliveryBoy(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const updatedOrder = await OrderService.assignZavoraDeliveryBoy(id, req.user!.userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Order assigned to Zavora Delivery Boy',
      data: updatedOrder,
    });
  }

  public static async cancelOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await OrderService.updateOrderStatus(
      id,
      'CANCELLED',
      {
        userId: req.user!.userId,
        role: req.user!.role,
        name: req.user!.name,
      },
      { cancellationReason: reason || 'Customer requested cancellation' }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Order cancelled',
      data: order,
    });
  }
}
