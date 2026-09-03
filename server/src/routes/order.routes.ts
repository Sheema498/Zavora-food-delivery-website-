import { Router } from 'express';
import { z } from 'zod';
import { OrderController } from '../controllers/order.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

const createOrderSchema = z.object({
  restaurantId: z.string().optional(),
  addressId: z.string().min(1, 'Address ID is required'),
  items: z
    .array(
      z.object({
        foodItemId: z.string().min(1),
        quantity: z.number().int().positive(),
        specialInstructions: z.string().optional(),
      })
    )
    .min(1, 'At least one item required'),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'ONLINE_DEMO_PAY']),
  couponCode: z.string().optional(),
  tipAmount: z.number().min(0).optional(),
  customerNotes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'RESTAURANT_ACCEPTED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'DELIVERY_ASSIGNED',
    'DELIVERY_ACCEPTED',
    'ARRIVED_AT_RESTAURANT',
    'PICKED_UP',
    'ON_THE_WAY',
    'DELIVERED',
    'RESTAURANT_REJECTED',
    'CANCELLED',
  ]),
  rejectionReason: z.string().optional(),
  cancellationReason: z.string().optional(),
  estimatedPrepMinutes: z.number().int().positive().optional(),
  restaurantNotes: z.string().optional(),
});

const cancelOrderSchema = z.object({
  reason: z.string().optional(),
});

router.use(authenticateJwt);

router.post('/', validateBody(createOrderSchema), asyncHandler(OrderController.create));
router.get('/customer/my-orders', asyncHandler(OrderController.getCustomerOrders));
router.get('/restaurant/orders', asyncHandler(OrderController.getRestaurantOrders));
router.get('/:id', asyncHandler(OrderController.getById));
router.put('/:id/status', validateBody(updateStatusSchema), asyncHandler(OrderController.updateStatus));
router.post('/:id/assign-delivery', asyncHandler(OrderController.assignDeliveryBoy));
router.post('/:id/cancel', validateBody(cancelOrderSchema), asyncHandler(OrderController.cancelOrder));

export default router;
