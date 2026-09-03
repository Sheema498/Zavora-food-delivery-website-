import { Router } from 'express';
import authRoutes from './auth.routes.js';
import restaurantRoutes from './restaurant.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import deliveryRoutes from './delivery.routes.js';
import adminRoutes from './admin.routes.js';
import userRoutes from './user.routes.js';
import reviewRoutes from './review.routes.js';
import couponRoutes from './coupon.routes.js';
import notificationRoutes from './notification.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/restaurants', restaurantRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/delivery', deliveryRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/coupons', couponRoutes);
apiRouter.use('/notifications', notificationRoutes);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'Zavora Single-Restaurant Food Delivery Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default apiRouter;
