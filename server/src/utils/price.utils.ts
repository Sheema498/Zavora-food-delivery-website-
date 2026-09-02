import { config } from '../config/index.js';

export interface PriceBreakdown {
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  tipAmount: number;
  totalAmount: number;
}

export const calculateOrderPriceBreakdown = (
  items: Array<{ unitPrice: number; quantity: number }>,
  deliveryDistanceKm = 3.0,
  couponDiscount = 0,
  tip = 0
): PriceBreakdown => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Free delivery over threshold
  const deliveryFee =
    subtotal >= (config?.platform?.freeDeliveryThreshold || 500)
      ? 0
      : (config?.platform?.defaultDeliveryFee || 40) +
        Math.max(0, (deliveryDistanceKm - 3.0) * 8.0);

  // 5% GST
  const taxAmount = (subtotal * (config?.platform?.taxRatePercentage || 5)) / 100;

  const discountAmount = Math.min(couponDiscount, subtotal);
  const totalAmount = Math.max(0, subtotal + taxAmount + deliveryFee - discountAmount + tip);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    tipAmount: Math.round(tip * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
};

export const calculateOrderPricing = (params: {
  subtotal: number;
  deliveryFee?: number;
  tipAmount?: number;
  coupon?: {
    discountType: 'PERCENTAGE' | 'FLAT';
    discountValue: number;
    maxDiscountAmount?: number;
    minOrderAmount?: number;
  };
}): PriceBreakdown => {
  let discount = 0;
  if (params.coupon) {
    if (params.coupon.discountType === 'PERCENTAGE') {
      discount = (params.subtotal * params.coupon.discountValue) / 100;
      if (params.coupon.maxDiscountAmount) {
        discount = Math.min(discount, params.coupon.maxDiscountAmount);
      }
    } else {
      discount = params.coupon.discountValue;
    }
  }

  const subtotal = params.subtotal;
  const deliveryFee = params.deliveryFee !== undefined ? params.deliveryFee : 40.0;
  const taxAmount = (subtotal * 5) / 100;
  const tipAmount = params.tipAmount || 0;
  const discountAmount = Math.min(discount, subtotal);
  const totalAmount = Math.max(0, subtotal + deliveryFee + taxAmount - discountAmount + tipAmount);

  return {
    subtotal,
    deliveryFee,
    taxAmount,
    discountAmount,
    tipAmount,
    totalAmount,
  };
};
