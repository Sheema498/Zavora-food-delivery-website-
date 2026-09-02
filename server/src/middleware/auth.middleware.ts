import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { verifyToken } from '../utils/jwt.utils.js';
import { HTTP_STATUS } from '../constants/index.js';

export const authenticateJwt = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Authentication required. Missing or malformed Bearer token.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid or expired token';
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: `Authentication failed: ${errorMsg}`,
    });
  }
};

/**
 * Optional authentication: attaches user if valid token exists, otherwise proceeds as guest
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      req.user = verifyToken(token);
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
};
