/**
 * QuickBite Platform Financial Ledger & Double-Entry Reconciliation
 * Implements strict double-entry ledger balancing for every order transaction:
 * Gross Customer Collection = Restaurant Settlement (85%) + Platform Take (15%) + Delivery Fee + GST Tax + 100% Tips
 */

export interface LedgerEntry {
  transactionId: string;
  orderId: string;
  orderNumber: string;
  timestamp: string;
  grossAmountPaid: number;
  foodSubtotal: number;
  restaurantSettlement: number;
  platformTake: number;
  deliveryFee: number;
  driverBaseAndDistancePay: number;
  customerTipPassThrough: number;
  gstTaxPayable: number;
  couponDiscountFundedByPlatform: number;
  isBalanced: boolean;
}

export interface PlatformFinancialSummary {
  period: string;
  totalOrders: number;
  grossVolumeGmv: number;
  totalRestaurantDisbursements: number;
  totalPlatformCommissionRetained: number;
  totalCourierEarningsDisbursed: number;
  totalGstTaxCollected: number;
  totalDiscountsSubsidized: number;
  netPlatformEbitda: number;
  reconciliationStatus: 'PERFECTLY_BALANCED' | 'DISCREPANCY_DETECTED';
}

export class FinancialLedgerService {
  /**
   * Calculate complete double-entry ledger entry for a completed order
   */
  public static calculateLedgerEntry(order: {
    id: string;
    orderNumber: string;
    subtotal: number;
    deliveryFee: number;
    taxAmount: number;
    discountAmount: number;
    tipAmount: number;
    totalAmount: number;
    commissionRate?: number;
    createdAt: Date | string;
  }): LedgerEntry {
    const commissionRate = order.commissionRate || 0.15;
    const foodSubtotal = order.subtotal;

    // Restaurant gets (Subtotal - Platform Commission)
    const platformTake = Number((foodSubtotal * commissionRate).toFixed(2));
    const restaurantSettlement = Number((foodSubtotal - platformTake).toFixed(2));

    // Courier gets Delivery Fee (e.g. ₹40) + Base supplement (₹25) + 100% of customer tip
    const driverPay = Number((order.deliveryFee + 25.0).toFixed(2));
    const tipPassThrough = order.tipAmount;

    // Tax liability
    const gstTax = order.taxAmount;

    // Verify equation balance:
    // Total Paid = Subtotal + DeliveryFee + Tax + Tip - Discount
    const expectedTotal = Number(
      (order.subtotal + order.deliveryFee + order.taxAmount + order.tipAmount - order.discountAmount).toFixed(2)
    );

    const isBalanced = Math.abs(expectedTotal - order.totalAmount) < 0.05;

    return {
      transactionId: `tx-${order.id.slice(0, 8)}-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      timestamp: typeof order.createdAt === 'string' ? order.createdAt : order.createdAt.toISOString(),
      grossAmountPaid: order.totalAmount,
      foodSubtotal: order.subtotal,
      restaurantSettlement,
      platformTake,
      deliveryFee: order.deliveryFee,
      driverBaseAndDistancePay: driverPay,
      customerTipPassThrough: tipPassThrough,
      gstTaxPayable: gstTax,
      couponDiscountFundedByPlatform: order.discountAmount,
      isBalanced,
    };
  }

  /**
   * Aggregate multiple ledger entries into an executive financial summary
   */
  public static aggregateFinancialSummary(
    period: string,
    entries: LedgerEntry[]
  ): PlatformFinancialSummary {
    let grossGmv = 0;
    let restDisbursements = 0;
    let platformCommission = 0;
    let courierDisbursements = 0;
    let gstTax = 0;
    let discounts = 0;
    let hasDiscrepancy = false;

    for (const entry of entries) {
      grossGmv += entry.grossAmountPaid;
      restDisbursements += entry.restaurantSettlement;
      platformCommission += entry.platformTake;
      courierDisbursements += entry.driverBaseAndDistancePay + entry.customerTipPassThrough;
      gstTax += entry.gstTaxPayable;
      discounts += entry.couponDiscountFundedByPlatform;

      if (!entry.isBalanced) {
        hasDiscrepancy = true;
      }
    }

    const netEbitda = platformCommission - discounts;

    return {
      period,
      totalOrders: entries.length,
      grossVolumeGmv: Number(grossGmv.toFixed(2)),
      totalRestaurantDisbursements: Number(restDisbursements.toFixed(2)),
      totalPlatformCommissionRetained: Number(platformCommission.toFixed(2)),
      totalCourierEarningsDisbursed: Number(courierDisbursements.toFixed(2)),
      totalGstTaxCollected: Number(gstTax.toFixed(2)),
      totalDiscountsSubsidized: Number(discounts.toFixed(2)),
      netPlatformEbitda: Number(netEbitda.toFixed(2)),
      reconciliationStatus: hasDiscrepancy ? 'DISCREPANCY_DETECTED' : 'PERFECTLY_BALANCED',
    };
  }
}
