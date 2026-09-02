import { Router } from 'express';
import { z } from 'zod';
import { CouponController } from '../controllers/coupon.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

const validateCouponSchema = z.object({
  code: z.string().min(2, 'Coupon code is required'),
  orderSubtotal: z.number().nonnegative(),
});

router.post('/validate', validateBody(validateCouponSchema), asyncHandler(CouponController.validate));
router.get('/active', asyncHandler(CouponController.listActive));

export default router;
