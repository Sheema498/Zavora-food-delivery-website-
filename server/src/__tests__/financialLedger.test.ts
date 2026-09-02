import { describe, it, expect } from 'vitest';
import { FinancialLedgerService } from '../domain/analytics/financialLedger.js';

describe('Financial Ledger & Double-Entry Accounting', () => {
  it('should balance double-entry transactions perfectly', () => {
    const entry = FinancialLedgerService.calculateLedgerEntry({
      id: 'order-123',
      orderNumber: 'QB-9988',
      subtotal: 600.0,
      deliveryFee: 40.0,
      taxAmount: 30.0, // 5% of 600
      discountAmount: 50.0,
      tipAmount: 20.0,
      totalAmount: 640.0, // 600 + 40 + 30 + 20 - 50 = 640
      commissionRate: 0.15,
      createdAt: new Date(),
    });

    expect(entry.isBalanced).toBe(true);
    expect(entry.platformTake).toBe(90.0); // 15% of 600
    expect(entry.restaurantSettlement).toBe(510.0); // 85% of 600
    expect(entry.driverBaseAndDistancePay).toBe(65.0); // 40 + 25
    expect(entry.customerTipPassThrough).toBe(20.0);
  });

  it('should aggregate monthly financial ledger reports with zero discrepancy', () => {
    const entry1 = FinancialLedgerService.calculateLedgerEntry({
      id: 'order-1',
      orderNumber: 'QB-1',
      subtotal: 400.0,
      deliveryFee: 40.0,
      taxAmount: 20.0,
      discountAmount: 0,
      tipAmount: 10.0,
      totalAmount: 470.0,
      createdAt: new Date(),
    });

    const entry2 = FinancialLedgerService.calculateLedgerEntry({
      id: 'order-2',
      orderNumber: 'QB-2',
      subtotal: 800.0,
      deliveryFee: 40.0,
      taxAmount: 40.0,
      discountAmount: 100.0,
      tipAmount: 30.0,
      totalAmount: 810.0,
      createdAt: new Date(),
    });

    const summary = FinancialLedgerService.aggregateFinancialSummary('September 2026', [entry1, entry2]);

    expect(summary.totalOrders).toBe(2);
    expect(summary.grossVolumeGmv).toBe(1280.0); // 470 + 810
    expect(summary.reconciliationStatus).toBe('PERFECTLY_BALANCED');
  });
});
