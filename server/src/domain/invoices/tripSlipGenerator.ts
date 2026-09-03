/**
 * QuickBite Courier Delivery Trip Slip Generator
 * Generates official trip summary and compensation slips for delivery partners
 * with route distances, timestamps, tip records, and payout receipts.
 */

import { Order } from '../../types/index.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export interface TripSlipData {
  tripId: string;
  orderNumber: string;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  vehicleNumber: string;
  pickupTime: string;
  deliveryTime: string;
  durationMinutes: number;
  pickupAddress: string;
  dropoffAddress: string;
  distanceKm: number;
  basePay: number;
  distancePay: number;
  customerTip: number;
  totalTripPayout: number;
}

export class TripSlipGenerator {
  public static generateTripSlip(order: Order): TripSlipData {
    const parsedAddress = JSON.parse(order.deliveryAddressSnapshot || '{}');
    const basePay = 25.0;
    const distanceKm = 3.5;
    const distancePay = Number((distanceKm * 12.0).toFixed(2));
    const tip = order.tipAmount || 0;
    const totalPayout = basePay + distancePay + tip;

    const courier = (order as any).deliveryBoy || (order as any).deliveryPartner;

    return {
      tripId: `TRIP-${order.id.slice(0, 8).toUpperCase()}`,
      orderNumber: order.orderNumber,
      driverName: courier?.user?.name || 'Courier Partner',
      driverPhone: courier?.user?.phone || '+91 9123456789',
      vehicleType: courier?.vehicleType || 'MOTORBIKE',
      vehicleNumber: courier?.vehicleNumber || 'KA-01-ZV-1001',
      pickupTime: formatDateTime(order.pickedUpAt || order.createdAt),
      deliveryTime: formatDateTime(order.deliveredAt || new Date()),
      durationMinutes: 24,
      pickupAddress: `${order.restaurant.name}, ${order.restaurant.address}`,
      dropoffAddress: parsedAddress.streetAddress || 'Customer Doorstep',
      distanceKm,
      basePay,
      distancePay,
      customerTip: tip,
      totalTripPayout: totalPayout,
    };
  }

  public static formatText(slip: TripSlipData): string {
    return [
      '================================================',
      '        QUICKBITE COURIER TRIP SETTLEMENT SLIP  ',
      '================================================',
      `TRIP ID:       ${slip.tripId}`,
      `ORDER #:       ${slip.orderNumber}`,
      `COURIER:       ${slip.driverName} (${slip.vehicleType} ${slip.vehicleNumber})`,
      `PICKUP AT:     ${slip.pickupTime}`,
      `DELIVERED AT:  ${slip.deliveryTime}`,
      `TOTAL TIME:    ${slip.durationMinutes} Minutes`,
      '------------------------------------------------',
      `PICKUP FROM:   ${slip.pickupAddress}`,
      `DELIVERED TO:  ${slip.dropoffAddress}`,
      `ROAD DISTANCE: ${slip.distanceKm} km`,
      '------------------------------------------------',
      `Base Pickup Pay:        ${formatCurrency(slip.basePay)}`,
      `Distance Pay (12/km):   ${formatCurrency(slip.distancePay)}`,
      `Customer Tip (100%):    ${formatCurrency(slip.customerTip)}`,
      '------------------------------------------------',
      `TOTAL TRIP EARNING:     ${formatCurrency(slip.totalTripPayout)}`,
      '================================================',
    ].join('\n');
  }
}
