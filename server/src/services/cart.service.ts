import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { HTTP_STATUS } from '../constants/index.js';

export class CartService {
  public static async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            deliveryFee: true,
            minOrderAmount: true,
            isOpen: true,
            latitude: true,
            longitude: true,
          },
        },
        items: {
          include: {
            foodItem: {
              select: {
                id: true,
                name: true,
                price: true,
                discountPrice: true,
                imageUrl: true,
                isAvailable: true,
                isVegetarian: true,
                prepTimeMinutes: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              slug: true,
              deliveryFee: true,
              minOrderAmount: true,
              isOpen: true,
              latitude: true,
              longitude: true,
            },
          },
          items: {
            include: {
              foodItem: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  discountPrice: true,
                  imageUrl: true,
                  isAvailable: true,
                  isVegetarian: true,
                  prepTimeMinutes: true,
                },
              },
            },
          },
        },
      });
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.foodItem.discountPrice || item.foodItem.price;
      return sum + price * item.quantity;
    }, 0);

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      cartId: cart.id,
      restaurant: cart.restaurant,
      items: cart.items,
      itemCount,
      subtotal: Math.round(subtotal * 100) / 100,
    };
  }

  public static async addItem(
    userId: string,
    foodItemId: string,
    quantity = 1,
    specialInstructions?: string,
    clearExistingIfDifferent = false
  ) {
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodItemId },
      include: { restaurant: true },
    });

    if (!foodItem || !foodItem.isAvailable) {
      throw new AppError('Food item is currently unavailable', HTTP_STATUS.BAD_REQUEST);
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          restaurantId: foodItem.restaurantId,
        },
        include: { items: true },
      });
    }

    if (!cart.restaurantId) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: { restaurantId: foodItem.restaurantId },
      });
    }

    const unitPrice = foodItem.discountPrice || foodItem.price;

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, foodItemId },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          specialInstructions: specialInstructions || existingItem.specialInstructions,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          foodItemId,
          quantity,
          unitPrice,
          specialInstructions,
        },
      });
    }

    return this.getCart(userId);
  }

  public static async updateItemQuantity(userId: string, cartItemId: string, quantity: number) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new AppError('Cart not found', HTTP_STATUS.NOT_FOUND);
    }

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: { id: cartItemId, cartId: cart.id },
      });

      // If cart is now empty, clear restaurantId
      const remaining = await prisma.cartItem.count({ where: { cartId: cart.id } });
      if (remaining === 0) {
        await prisma.cart.update({
          where: { id: cart.id },
          data: { restaurantId: null },
        });
      }
    } else {
      await prisma.cartItem.updateMany({
        where: { id: cartItemId, cartId: cart.id },
        data: { quantity },
      });
    }

    return this.getCart(userId);
  }

  public static async removeItem(userId: string, cartItemId: string) {
    return this.updateItemQuantity(userId, cartItemId, 0);
  }

  public static async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await prisma.cart.update({
        where: { id: cart.id },
        data: { restaurantId: null },
      });
    }

    return { success: true, message: 'Cart cleared successfully' };
  }
}
