import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, Role } from '../types/index.js';
import { HTTP_STATUS } from '../constants/index.js';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Authentication required before checking permissions',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: `Access forbidden. Required role: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};

export const requireSuperAdmin = requireRole('SUPER_ADMIN', 'ADMIN');
export const requireRestaurantManager = requireRole('RESTAURANT_MANAGER', 'RESTAURANT', 'RESTAURANT_ADMIN', 'SUPER_ADMIN', 'ADMIN');
export const requireDeliveryBoy = requireRole('DELIVERY_BOY', 'DELIVERY_PARTNER', 'SUPER_ADMIN', 'ADMIN');
export const requireCustomer = requireRole('CUSTOMER', 'SUPER_ADMIN', 'ADMIN');

// Aliases
export const requireAdmin = requireSuperAdmin;
export const requireRestaurant = requireRestaurantManager;
export const requireDeliveryPartner = requireDeliveryBoy;
