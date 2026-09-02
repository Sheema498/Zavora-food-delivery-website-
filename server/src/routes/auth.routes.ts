import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'RESTAURANT', 'DELIVERY_PARTNER', 'ADMIN']).optional(),
  vehicleType: z.enum(['BICYCLE', 'MOTORBIKE', 'SCOOTER', 'CAR']).optional(),
  vehicleNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  restaurantName: z.string().optional(),
  restaurantAddress: z.string().optional(),
  restaurantPhone: z.string().optional(),
  cuisineTypes: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

router.post('/register', authRateLimiter, validateBody(registerSchema), asyncHandler(AuthController.register));
router.post('/login', authRateLimiter, validateBody(loginSchema), asyncHandler(AuthController.login));
router.get('/me', authenticateJwt, asyncHandler(AuthController.getMe));
router.put('/profile', authenticateJwt, validateBody(updateProfileSchema), asyncHandler(AuthController.updateProfile));

export default router;
