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

export const requireAdmin = requireRole('ADMIN', 'SUPER_ADMIN');
export const requireRestaurant = requireRole('RESTAURANT', 'RESTAURANT_ADMIN', 'ADMIN', 'SUPER_ADMIN');
export const requireDeliveryPartner = requireRole('DELIVERY_PARTNER', 'ADMIN', 'SUPER_ADMIN');
export const requireCustomer = requireRole('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');
