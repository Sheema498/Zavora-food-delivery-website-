import { describe, it, expect } from 'vitest';
import { calculateOrderPricing } from '../utils/price.utils.js';

describe('Pricing & Tax Calculations', () => {
  it('should calculate 5% GST tax and correct total without coupon', () => {
    const pricing = calculateOrderPricing({
      subtotal: 500.0,
      deliveryFee: 40.0,
      tipAmount: 20.0,
    });

    expect(pricing.subtotal).toBe(500.0);
    expect(pricing.deliveryFee).toBe(40.0);
    expect(pricing.taxAmount).toBe(25.0); // 5% of 500
    expect(pricing.discountAmount).toBe(0);
    expect(pricing.tipAmount).toBe(20.0);
    expect(pricing.totalAmount).toBe(585.0); // 500 + 40 + 25 + 20
  });

  it('should apply percentage coupon with max discount cap', () => {
    const pricing = calculateOrderPricing({
      subtotal: 1000.0,
      deliveryFee: 40.0,
      coupon: {
        discountType: 'PERCENTAGE',
        discountValue: 50, // 50%
        maxDiscountAmount: 150.0, // Capped at 150
        minOrderAmount: 200.0,
      },
    });

    expect(pricing.discountAmount).toBe(150.0);
    expect(pricing.taxAmount).toBe(50.0); // 5% of 1000
    expect(pricing.totalAmount).toBe(940.0); // 1000 + 40 + 50 - 150
  });

  it('should apply fixed discount coupon', () => {
    const pricing = calculateOrderPricing({
      subtotal: 300.0,
      deliveryFee: 40.0,
      coupon: {
        discountType: 'FLAT',
        discountValue: 50.0,
        minOrderAmount: 100.0,
      },
    });

    expect(pricing.discountAmount).toBe(50.0);
    expect(pricing.taxAmount).toBe(15.0);
    expect(pricing.totalAmount).toBe(305.0); // 300 + 40 + 15 - 50
  });
});
