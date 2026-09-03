import { Router } from 'express';
import { z } from 'zod';
import { DeliveryController } from '../controllers/delivery.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { requireDeliveryPartner, requireRestaurantManager } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

const assignSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  deliveryBoyId: z.string().optional(),
  deliveryPartnerId: z.string().optional(),
});

const onlineSchema = z.object({
  isOnline: z.boolean(),
});

router.use(authenticateJwt);

// Manager & Admin delivery queries & dispatch
router.get('/available-partners', asyncHandler(DeliveryController.getAvailableDrivers));
router.post('/assign', requireRestaurantManager, validateBody(assignSchema), asyncHandler(DeliveryController.assignDriver));

// Delivery Partner actions
router.get('/active', requireDeliveryPartner, asyncHandler(DeliveryController.getActiveDelivery));
router.get('/history', requireDeliveryPartner, asyncHandler(DeliveryController.getHistory));
router.get('/earnings', requireDeliveryPartner, asyncHandler(DeliveryController.getEarnings));
router.post('/orders/:orderId/accept', requireDeliveryPartner, asyncHandler(DeliveryController.acceptAssignment));
router.post('/orders/:orderId/arrived', requireDeliveryPartner, asyncHandler(DeliveryController.markArrived));
router.post('/orders/:orderId/pickup', requireDeliveryPartner, asyncHandler(DeliveryController.markPickedUp));
router.post('/orders/:orderId/start', requireDeliveryPartner, asyncHandler(DeliveryController.startDelivery));
router.post('/orders/:orderId/complete', requireDeliveryPartner, asyncHandler(DeliveryController.completeDelivery));
router.put('/online-status', requireDeliveryPartner, validateBody(onlineSchema), asyncHandler(DeliveryController.toggleOnline));

export default router;
