import { Router } from 'express';
import { z } from 'zod';
import { UserController } from '../controllers/user.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

const addressSchema = z.object({
  label: z.string().optional(),
  recipientName: z.string().optional(),
  phone: z.string().optional(),
  streetAddress: z.string().min(5, 'Street address required'),
  landmark: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().min(4, 'Postal code required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional(),
});

router.use(authenticateJwt);

router.get('/addresses', asyncHandler(UserController.getAddresses));
router.post('/addresses', validateBody(addressSchema), asyncHandler(UserController.addAddress));
router.put('/addresses/:id', validateBody(addressSchema), asyncHandler(UserController.updateAddress));
router.delete('/addresses/:id', asyncHandler(UserController.deleteAddress));

export default router;
