import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AuditService } from './audit.service.js';

export class ReviewService {
  public static async createReview(
    customerId: string,
    data: {
      orderId: string;
      rating: number;
      comment?: string;
    }
  ) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    if (order.customerId !== customerId) {
      throw new AppError('You can only review orders placed by your account', HTTP_STATUS.FORBIDDEN);
    }

    if (order.status !== 'DELIVERED') {
      throw new AppError('You can only review completed/delivered orders', HTTP_STATUS.BAD_REQUEST);
    }

    const existing = await prisma.restaurantReview.findUnique({
      where: { orderId: data.orderId },
    });

    if (existing) {
      throw new AppError('You have already submitted a review for this order', HTTP_STATUS.CONFLICT);
    }

    const review = await prisma.restaurantReview.create({
      data: {
        restaurantId: order.restaurantId,
        customerId,
        orderId: data.orderId,
        rating: Math.min(5, Math.max(1, data.rating)),
        comment: data.comment?.trim() || null,
        isVerified: true,
      },
    });

    // Recalculate restaurant rating
    const stats = await prisma.restaurantReview.aggregate({
      where: { restaurantId: order.restaurantId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const newRating = stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 4.5;
    const totalRatings = stats._count.rating || 0;

    await prisma.restaurant.update({
      where: { id: order.restaurantId },
      data: { rating: newRating, totalRatings },
    });

    await AuditService.log({
      userId: customerId,
      action: 'REVIEW_CREATED',
      resource: 'RestaurantReview',
      resourceId: review.id,
      metadata: { restaurantId: order.restaurantId, rating: review.rating },
    });

    return review;
  }

  public static async replyToReview(
    reviewId: string,
    restaurantId: string,
    reply: string,
    userId: string
  ) {
    const review = await prisma.restaurantReview.findFirst({
      where: { id: reviewId, restaurantId },
    });

    if (!review) {
      throw new AppError('Review not found for your restaurant', HTTP_STATUS.NOT_FOUND);
    }

    const updated = await prisma.restaurantReview.update({
      where: { id: reviewId },
      data: { replyFromRestaurant: reply.trim() },
    });

    await AuditService.log({
      userId,
      action: 'REVIEW_REPLIED',
      resource: 'RestaurantReview',
      resourceId: reviewId,
    });

    return updated;
  }
}
