import { Router } from 'express';
import { z } from 'zod';
import { RestaurantController } from '../controllers/restaurant.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { requireRestaurant } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

const foodItemSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'Item name is required'),
  description: z.string().min(5, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  discountPrice: z.number().positive().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  prepTimeMinutes: z.number().int().positive().optional(),
  calories: z.number().int().optional().nullable(),
});

const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  displayOrder: z.number().int().optional(),
});

const statusSchema = z.object({
  isOpen: z.boolean(),
});

// Public discovery endpoints
router.get('/discovery/categories', asyncHandler(RestaurantController.listCategories));
router.get('/discovery/food-items', asyncHandler(RestaurantController.searchFoodItems));
router.get('/', asyncHandler(RestaurantController.list));
router.get('/:id', asyncHandler(RestaurantController.getById));
router.get('/:id/menu', asyncHandler(RestaurantController.getMenu));

// Restaurant Staff / Portal endpoints
router.get('/portal/stats', authenticateJwt, requireRestaurant, asyncHandler(RestaurantController.getStats));
router.post('/portal/food-items', authenticateJwt, requireRestaurant, validateBody(foodItemSchema), asyncHandler(RestaurantController.addFoodItem));
router.put('/portal/food-items/:itemId', authenticateJwt, requireRestaurant, asyncHandler(RestaurantController.updateFoodItem));
router.delete('/portal/food-items/:itemId', authenticateJwt, requireRestaurant, asyncHandler(RestaurantController.deleteFoodItem));
router.post('/portal/categories', authenticateJwt, requireRestaurant, validateBody(categorySchema), asyncHandler(RestaurantController.addCategory));
router.put('/portal/status', authenticateJwt, requireRestaurant, validateBody(statusSchema), asyncHandler(RestaurantController.toggleStatus));

export default router;
