import { Response } from 'express';
import { ReviewService } from '../services/review.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { HTTP_STATUS } from '../constants/index.js';

export class ReviewController {
  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const customerId = req.user!.userId;
    const review = await ReviewService.createReview(customerId, req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  }

  public static async reply(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { reviewId } = req.params;
    const { reply } = req.body;
    const restaurantId = req.user?.restaurantId || req.body.restaurantId;

    const updated = await ReviewService.replyToReview(
      reviewId,
      restaurantId,
      reply,
      req.user!.userId
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Reply saved',
      data: updated,
    });
  }
}
