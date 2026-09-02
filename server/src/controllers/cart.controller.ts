import { Response } from 'express';
import { CartService } from '../services/cart.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { HTTP_STATUS } from '../constants/index.js';

export class CartController {
  public static async getCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const cart = await CartService.getCart(userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: cart,
    });
  }

  public static async addItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { foodItemId, quantity, specialInstructions, clearExistingIfDifferent } = req.body;

    const cart = await CartService.addItem(
      userId,
      foodItemId,
      quantity,
      specialInstructions,
      clearExistingIfDifferent
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Item added to cart',
      data: cart,
    });
  }

  public static async updateQuantity(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    const cart = await CartService.updateItemQuantity(userId, cartItemId, quantity);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: cart,
    });
  }

  public static async removeItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { cartItemId } = req.params;

    const cart = await CartService.removeItem(userId, cartItemId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  }

  public static async clearCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const result = await CartService.clearCart(userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
    });
  }
}
