import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service.js';
import { HTTP_STATUS } from '../constants/index.js';

export class CouponController {
  public static async validate(req: Request, res: Response): Promise<void> {
    const { code, orderSubtotal } = req.body;
    const result = await CouponService.validateCoupon(code, Number(orderSubtotal));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Coupon applied successfully',
      data: result,
    });
  }

  public static async listActive(_req: Request, res: Response): Promise<void> {
    const coupons = await CouponService.listActiveCoupons();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: coupons,
    });
  }
}
