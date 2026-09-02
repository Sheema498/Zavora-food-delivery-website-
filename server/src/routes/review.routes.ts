import { Router } from 'express';
import { z } from 'zod';
import { ReviewController } from '../controllers/review.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { requireRestaurant } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

const createReviewSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

const replyReviewSchema = z.object({
  reply: z.string().min(2, 'Reply text is required'),
  restaurantId: z.string().optional(),
});

router.use(authenticateJwt);

router.post('/', validateBody(createReviewSchema), asyncHandler(ReviewController.create));
router.post('/:reviewId/reply', requireRestaurant, validateBody(replyReviewSchema), asyncHandler(ReviewController.reply));

export default router;
