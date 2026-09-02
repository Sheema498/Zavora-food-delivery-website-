import { Router } from 'express';
import { z } from 'zod';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

const statusToggleSchema = z.object({
  isActive: z.boolean(),
});

const broadcastSchema = z.object({
  title: z.string().min(2, 'Title required'),
  message: z.string().min(5, 'Message required'),
  targetRole: z.enum(['CUSTOMER', 'RESTAURANT', 'DELIVERY_PARTNER', 'ADMIN']).optional(),
});

router.use(authenticateJwt, requireAdmin);

router.get('/stats', asyncHandler(AdminController.getDashboardStats));
router.get('/live-orders', asyncHandler(AdminController.getLiveOrders));
router.get('/users', asyncHandler(AdminController.listUsers));
router.put('/users/:userId/status', validateBody(statusToggleSchema), asyncHandler(AdminController.toggleUserStatus));
router.get('/audit-logs', asyncHandler(AdminController.getAuditLogs));
router.post('/broadcast', validateBody(broadcastSchema), asyncHandler(AdminController.broadcastNotification));

export default router;
