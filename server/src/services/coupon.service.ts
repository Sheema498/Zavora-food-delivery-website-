import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { HTTP_STATUS } from '../constants/index.js';

export class CouponService {
  public static async validateCoupon(code: string, orderSubtotal: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError('Invalid or inactive coupon code', HTTP_STATUS.BAD_REQUEST);
    }

    const now = new Date();
    if (coupon.validFrom > now || coupon.validUntil < now) {
      throw new AppError('This coupon has expired', HTTP_STATUS.BAD_REQUEST);
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('This coupon has reached its maximum usage limit', HTTP_STATUS.BAD_REQUEST);
    }

    if (orderSubtotal < coupon.minOrderAmount) {
      throw new AppError(
        `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, orderSubtotal);

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount: Math.round(discount * 100) / 100,
    };
  }

  public static async listActiveCoupons() {
    const now = new Date();
    return prisma.coupon.findMany({
      where: {
        isActive: true,
        validUntil: { gte: now },
      },
      orderBy: { discountValue: 'desc' },
    });
  }
}
