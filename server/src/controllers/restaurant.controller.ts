import { Request, Response } from 'express';
import { RestaurantService } from '../services/restaurant.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../middleware/error.middleware.js';

export class RestaurantController {
  public static async list(req: Request, res: Response): Promise<void> {
    const { search, cuisine, priceRange, rating, isOpen, isVegetarian, page, limit, sortBy } = req.query;

    const result = await RestaurantService.listRestaurants({
      search: search as string,
      cuisine: cuisine as string,
      priceRange: priceRange as string,
      rating: rating ? Number(rating) : undefined,
      isOpen: isOpen !== undefined ? isOpen === 'true' : undefined,
      isVegetarian: isVegetarian === 'true',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      sortBy: sortBy as any,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.restaurants,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const restaurant = await RestaurantService.getRestaurantBySlugOrId(id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: restaurant,
    });
  }

  public static async getMenu(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const menu = await RestaurantService.getRestaurantMenu(id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: menu,
    });
  }

  public static async listCategories(req: Request, res: Response): Promise<void> {
    const categories = await RestaurantService.listAllCategories();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: categories,
    });
  }

  public static async searchFoodItems(req: Request, res: Response): Promise<void> {
    const { search, category, cuisine, isVegetarian, maxPrice, limit } = req.query;
    const items = await RestaurantService.searchAllFoodItems({
      search: search as string,
      category: category as string,
      cuisine: cuisine as string,
      isVegetarian: isVegetarian === 'true',
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      limit: limit ? Number(limit) : 50,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: items,
    });
  }

  // Restaurant Portal Actions
  public static async addFoodItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const restaurantId = req.user?.restaurantId || req.params.restaurantId;
    if (!restaurantId) {
      throw new AppError('Restaurant ID missing from user context', HTTP_STATUS.BAD_REQUEST);
    }

    const item = await RestaurantService.addFoodItem(restaurantId, req.body, req.user?.userId);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Food item added successfully',
      data: item,
    });
  }

  public static async updateFoodItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const restaurantId = req.user?.restaurantId || req.params.restaurantId;
    const { itemId } = req.params;
    if (!restaurantId) {
      throw new AppError('Restaurant ID missing from user context', HTTP_STATUS.BAD_REQUEST);
    }

    const item = await RestaurantService.updateFoodItem(restaurantId, itemId, req.body, req.user?.userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Food item updated successfully',
      data: item,
    });
  }

  public static async deleteFoodItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const restaurantId = req.user?.restaurantId || req.params.restaurantId;
    const { itemId } = req.params;
    if (!restaurantId) {
      throw new AppError('Restaurant ID missing from user context', HTTP_STATUS.BAD_REQUEST);
    }

    const result = await RestaurantService.deleteFoodItem(restaurantId, itemId, req.user?.userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
    });
  }

  public static async addCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const restaurantId = req.user?.restaurantId || req.params.restaurantId;
    if (!restaurantId) {
      throw new AppError('Restaurant ID missing', HTTP_STATUS.BAD_REQUEST);
    }

    const category = await RestaurantService.addCategory(restaurantId, req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: category,
    });
  }

  public static async toggleStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const restaurantId = req.user?.restaurantId || req.params.restaurantId;
    if (!restaurantId) {
      throw new AppError('Restaurant ID missing', HTTP_STATUS.BAD_REQUEST);
    }

    const { isOpen } = req.body;
    const restaurant = await RestaurantService.toggleRestaurantStatus(restaurantId, isOpen);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Restaurant is now ${isOpen ? 'OPEN' : 'CLOSED'}`,
      data: restaurant,
    });
  }

  public static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const restaurantId = req.user?.restaurantId || req.params.restaurantId;
    if (!restaurantId) {
      throw new AppError('Restaurant ID missing', HTTP_STATUS.BAD_REQUEST);
    }

    const stats = await RestaurantService.getRestaurantStats(restaurantId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats,
    });
  }
}
