import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AuditService } from './audit.service.js';

export interface RestaurantQueryFilters {
  search?: string;
  cuisine?: string;
  priceRange?: string;
  rating?: number;
  isOpen?: boolean;
  isVegetarian?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'prepTime' | 'deliveryFee' | 'popular';
}

export class RestaurantService {
  public static async listRestaurants(filters: RestaurantQueryFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
        { cuisineTypes: { contains: filters.search } },
        {
          foodItems: {
            some: {
              name: { contains: filters.search },
              isAvailable: true,
            },
          },
        },
      ];
    }

    if (filters.cuisine) {
      where.cuisineTypes = { contains: filters.cuisine };
    }

    if (filters.priceRange) {
      where.priceRange = filters.priceRange;
    }

    if (filters.rating) {
      where.rating = { gte: Number(filters.rating) };
    }

    if (filters.isOpen !== undefined) {
      where.isOpen = filters.isOpen;
    }

    if (filters.isVegetarian) {
      where.foodItems = {
        some: {
          isVegetarian: true,
        },
      };
    }

    let orderBy: Record<string, string> = { rating: 'desc' };
    if (filters.sortBy === 'prepTime') {
      orderBy = { avgPrepTimeMinutes: 'asc' };
    } else if (filters.sortBy === 'deliveryFee') {
      orderBy = { deliveryFee: 'asc' };
    } else if (filters.sortBy === 'popular') {
      orderBy = { totalRatings: 'desc' };
    }

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { foodItems: true, reviews: true, orders: true },
          },
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    return {
      restaurants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public static async getRestaurantBySlugOrId(identifier: string) {
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            foodItems: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            customer: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: { reviews: true, foodItems: true },
        },
      },
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', HTTP_STATUS.NOT_FOUND);
    }

    return restaurant;
  }

  public static async getRestaurantMenu(restaurantId: string) {
    return prisma.foodCategory.findMany({
      where: { restaurantId, isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        foodItems: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  // Restaurant Portal Management
  public static async addFoodItem(
    restaurantId: string,
    data: {
      categoryId: string;
      name: string;
      description: string;
      price: number;
      discountPrice?: number;
      imageUrl?: string;
      isVegetarian?: boolean;
      isVegan?: boolean;
      isGlutenFree?: boolean;
      isSpicy?: boolean;
      prepTimeMinutes?: number;
      calories?: number;
    },
    userId?: string
  ) {
    const item = await prisma.foodItem.create({
      data: {
        restaurantId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice || null,
        imageUrl: data.imageUrl || null,
        isVegetarian: data.isVegetarian || false,
        isVegan: data.isVegan || false,
        isGlutenFree: data.isGlutenFree || false,
        isSpicy: data.isSpicy || false,
        prepTimeMinutes: data.prepTimeMinutes || 15,
        calories: data.calories || null,
        isAvailable: true,
      },
    });

    if (userId) {
      await AuditService.log({
        userId,
        action: 'FOOD_ITEM_CREATED',
        resource: 'FoodItem',
        resourceId: item.id,
        metadata: { restaurantId, name: item.name },
      });
    }

    return item;
  }

  public static async updateFoodItem(
    restaurantId: string,
    foodItemId: string,
    data: {
      categoryId?: string;
      name?: string;
      description?: string;
      price?: number;
      discountPrice?: number;
      imageUrl?: string;
      isAvailable?: boolean;
      isVegetarian?: boolean;
      isVegan?: boolean;
      isGlutenFree?: boolean;
      isSpicy?: boolean;
      prepTimeMinutes?: number;
      calories?: number;
    },
    userId?: string
  ) {
    const item = await prisma.foodItem.findFirst({
      where: { id: foodItemId, restaurantId },
    });

    if (!item) {
      throw new AppError('Food item not found in your restaurant', HTTP_STATUS.NOT_FOUND);
    }

    const updated = await prisma.foodItem.update({
      where: { id: foodItemId },
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice !== undefined ? data.discountPrice : undefined,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : undefined,
        isVegetarian: data.isVegetarian !== undefined ? data.isVegetarian : undefined,
        isVegan: data.isVegan !== undefined ? data.isVegan : undefined,
        isGlutenFree: data.isGlutenFree !== undefined ? data.isGlutenFree : undefined,
        isSpicy: data.isSpicy !== undefined ? data.isSpicy : undefined,
        prepTimeMinutes: data.prepTimeMinutes,
        calories: data.calories,
      },
    });

    if (userId) {
      await AuditService.log({
        userId,
        action: 'FOOD_ITEM_UPDATED',
        resource: 'FoodItem',
        resourceId: updated.id,
        metadata: { restaurantId, changes: data },
      });
    }

    return updated;
  }

  public static async deleteFoodItem(restaurantId: string, foodItemId: string, userId?: string) {
    const item = await prisma.foodItem.findFirst({
      where: { id: foodItemId, restaurantId },
    });

    if (!item) {
      throw new AppError('Food item not found', HTTP_STATUS.NOT_FOUND);
    }

    // Soft toggle or delete
    await prisma.foodItem.delete({
      where: { id: foodItemId },
    });

    if (userId) {
      await AuditService.log({
        userId,
        action: 'FOOD_ITEM_DELETED',
        resource: 'FoodItem',
        resourceId: foodItemId,
        metadata: { restaurantId, name: item.name },
      });
    }

    return { success: true, message: 'Food item deleted successfully' };
  }

  public static async addCategory(
    restaurantId: string,
    data: { name: string; displayOrder?: number }
  ) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    return prisma.foodCategory.create({
      data: {
        restaurantId,
        name: data.name,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        displayOrder: data.displayOrder || 0,
        isActive: true,
      },
    });
  }

  public static async toggleRestaurantStatus(restaurantId: string, isOpen: boolean) {
    return prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isOpen },
    });
  }

  public static async getRestaurantStats(restaurantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, pendingOrders, completedOrders, revenueData, popularItems] =
      await Promise.all([
        prisma.order.count({ where: { restaurantId } }),
        prisma.order.count({ where: { restaurantId, createdAt: { gte: today } } }),
        prisma.order.count({
          where: {
            restaurantId,
            status: { in: ['PENDING', 'RESTAURANT_ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'] },
          },
        }),
        prisma.order.count({ where: { restaurantId, status: 'DELIVERED' } }),
        prisma.order.aggregate({
          where: { restaurantId, status: 'DELIVERED' },
          _sum: { totalAmount: true },
        }),
        prisma.orderItem.groupBy({
          by: ['foodItemId', 'name'],
          where: { order: { restaurantId, status: 'DELIVERED' } },
          _sum: { quantity: true, totalPrice: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
        }),
      ]);

    const totalRevenue = revenueData._sum.totalAmount || 0;
    const netEarnings = totalRevenue * 0.85; // 85% payout after 15% platform commission

    return {
      totalOrders,
      todayOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      netEarnings,
      popularItems,
    };
  }

  public static async listAllCategories() {
    const categories = await prisma.foodCategory.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { foodItems: true } },
        restaurant: {
          select: { id: true, name: true, slug: true, logoUrl: true, rating: true, isOpen: true },
        },
        foodItems: {
          take: 3,
          where: { isAvailable: true },
          select: { id: true, name: true, price: true, imageUrl: true, isVegetarian: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return categories;
  }

  public static async searchAllFoodItems(filters: {
    search?: string;
    category?: string;
    cuisine?: string;
    isVegetarian?: boolean;
    maxPrice?: number;
    limit?: number;
  }) {
    const limit = filters.limit || 50;
    const where: Record<string, unknown> = { isAvailable: true };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    if (filters.isVegetarian) {
      where.isVegetarian = true;
    }

    if (filters.maxPrice) {
      where.price = { lte: Number(filters.maxPrice) };
    }

    if (filters.category) {
      where.category = {
        name: { contains: filters.category },
      };
    }

    if (filters.cuisine) {
      where.restaurant = {
        cuisineTypes: { contains: filters.cuisine },
      };
    }

    const items = await prisma.foodItem.findMany({
      where,
      take: limit,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            cuisineTypes: true,
            rating: true,
            isOpen: true,
            avgPrepTimeMinutes: true,
            deliveryFee: true,
          },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { isBestSeller: 'desc' },
    });

    return items;
  }
}

