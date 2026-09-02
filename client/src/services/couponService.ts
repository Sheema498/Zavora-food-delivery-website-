import ApiClient from '../api/client.js';
import { Coupon } from '../types/index.js';

export interface CouponValidationResult {
  valid: boolean;
  coupon: Coupon;
  discountAmount: number;
}

export const couponService = {
  async validateCoupon(code: string, orderSubtotal: number): Promise<CouponValidationResult> {
    const res = await ApiClient.post<CouponValidationResult>('/coupons/validate', {
      code,
      orderSubtotal,
    });
    return res.data;
  },

  async listActive(): Promise<Coupon[]> {
    const res = await ApiClient.get<Coupon[]>('/coupons/active');
    return res.data;
  },
};
