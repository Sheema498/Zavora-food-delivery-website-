import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { HTTP_STATUS } from '../constants/index.js';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await AuthService.register(req.body, ipAddress, userAgent);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Account created successfully',
      data: result,
    });
  }

  public static async login(req: Request, res: Response): Promise<void> {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await AuthService.login(req.body, ipAddress, userAgent);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const profile = await AuthService.getProfile(req.user.userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: profile,
    });
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const updated = await AuthService.updateProfile(req.user.userId, req.body);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    });
  }
}
