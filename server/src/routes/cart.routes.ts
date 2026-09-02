import { Router } from 'express';
import { z } from 'zod';
import { CartController } from '../controllers/cart.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

const addItemSchema = z.object({
  foodItemId: z.string().min(1, 'Food item ID is required'),
  quantity: z.number().int().positive().default(1),
  specialInstructions: z.string().optional(),
  clearExistingIfDifferent: z.boolean().optional(),
});

const updateQuantitySchema = z.object({
  quantity: z.number().int().min(0),
});

router.use(authenticateJwt);

router.get('/', asyncHandler(CartController.getCart));
router.post('/items', validateBody(addItemSchema), asyncHandler(CartController.addItem));
router.put('/items/:cartItemId', validateBody(updateQuantitySchema), asyncHandler(CartController.updateQuantity));
router.delete('/items/:cartItemId', asyncHandler(CartController.removeItem));
router.delete('/clear', asyncHandler(CartController.clearCart));

export default router;
