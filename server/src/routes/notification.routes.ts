import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

router.use(authenticateJwt);

router.get('/', asyncHandler(NotificationController.list));
router.put('/:id/read', asyncHandler(NotificationController.markRead));
router.put('/read-all', asyncHandler(NotificationController.markAllRead));

export default router;
