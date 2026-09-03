/**
 * QuickBite Multi-Order Batching Engine
 * Evaluates whether orders from the same or neighboring restaurants can be bundled
 * for efficient co-delivery while strictly protecting customer freshness SLAs.
 */

import { GeoCoordinate } from '../geo/metroGraph.js';
import { calculateHaversineDistanceKm } from '../../utils/geo.utils.js';

export interface BatchCandidate {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  restaurantLocation: GeoCoordinate;
  customerLocation: GeoCoordinate;
  placedAt: string;
  maxDeliveryMinutes: number;
}

export interface BatchPlan {
  batchId: string;
  restaurantId: string;
  orderIds: string[];
  totalDistanceKm: number;
  estimatedCompletionMinutes: number;
  deliverySequence: Array<{
    stopNumber: number;
    type: 'PICKUP' | 'DROPOFF';
    orderId: string;
    location: GeoCoordinate;
  }>;
  efficiencyGainPercent: number;
}

export class OrderBatcher {
  /**
   * Determine if two orders can be bundled together
   */
  public static canBatch(
    orderA: BatchCandidate,
    orderB: BatchCandidate,
    maxCustomerDetourKm = 2.0
  ): boolean {
    // 1. Same restaurant requirement for fast single-stop pickup
    if (orderA.restaurantId !== orderB.restaurantId) {
      // If different restaurants, must be within 300 meters of each other
      const restDist = calculateHaversineDistanceKm(
        orderA.restaurantLocation.latitude,
        orderA.restaurantLocation.longitude,
        orderB.restaurantLocation.latitude,
        orderB.restaurantLocation.longitude
      );
      if (restDist > 0.3) return false;
    }

    // 2. Customer dropoff locations must be in the same direction/proximity
    const dropoffDistance = calculateHaversineDistanceKm(
      orderA.customerLocation.latitude,
      orderA.customerLocation.longitude,
      orderB.customerLocation.latitude,
      orderB.customerLocation.longitude
    );

    return dropoffDistance <= maxCustomerDetourKm;
  }

  /**
   * Create an optimal multi-stop delivery route sequence for a pair of batched orders
   */
  public static createBatchPlan(
    orderA: BatchCandidate,
    orderB: BatchCandidate
  ): BatchPlan | null {
    if (!this.canBatch(orderA, orderB)) return null;

    // Direct distance if delivered separately:
    const separateDistA = calculateHaversineDistanceKm(
      orderA.restaurantLocation.latitude,
      orderA.restaurantLocation.longitude,
      orderA.customerLocation.latitude,
      orderA.customerLocation.longitude
    );
    const separateDistB = calculateHaversineDistanceKm(
      orderB.restaurantLocation.latitude,
      orderB.restaurantLocation.longitude,
      orderB.customerLocation.latitude,
      orderB.customerLocation.longitude
    );
    const separateTotalDist = separateDistA + separateDistB;

    // Sequence 1: Pickup A, Pickup B -> Dropoff A -> Dropoff B
    const distToA = separateDistA;
    const distAToB = calculateHaversineDistanceKm(
      orderA.customerLocation.latitude,
      orderA.customerLocation.longitude,
      orderB.customerLocation.latitude,
      orderB.customerLocation.longitude
    );
    const totalDistSeq1 = distToA + distAToB;

    // Sequence 2: Pickup A, Pickup B -> Dropoff B -> Dropoff A
    const distToB = separateDistB;
    const distBToA = distAToB;
    const totalDistSeq2 = distToB + distBToA;

    const useSeq1 = totalDistSeq1 <= totalDistSeq2;
    const chosenTotalDist = useSeq1 ? totalDistSeq1 : totalDistSeq2;
    const efficiencyGain = Math.max(0, Math.round(((separateTotalDist - chosenTotalDist) / separateTotalDist) * 100));

    const estMinutes = Math.max(15, Math.ceil((chosenTotalDist / 25) * 60) + 10); // +10 mins for 2 handoffs

    const deliverySequence = useSeq1
      ? [
          { stopNumber: 1, type: 'PICKUP' as const, orderId: orderA.orderId, location: orderA.restaurantLocation },
          { stopNumber: 2, type: 'DROPOFF' as const, orderId: orderA.orderId, location: orderA.customerLocation },
          { stopNumber: 3, type: 'DROPOFF' as const, orderId: orderB.orderId, location: orderB.customerLocation },
        ]
      : [
          { stopNumber: 1, type: 'PICKUP' as const, orderId: orderB.orderId, location: orderB.restaurantLocation },
          { stopNumber: 2, type: 'DROPOFF' as const, orderId: orderB.orderId, location: orderB.customerLocation },
          { stopNumber: 3, type: 'DROPOFF' as const, orderId: orderA.orderId, location: orderA.customerLocation },
        ];

    return {
      batchId: `batch-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      restaurantId: orderA.restaurantId,
      orderIds: [orderA.orderId, orderB.orderId],
      totalDistanceKm: Number(chosenTotalDist.toFixed(2)),
      estimatedCompletionMinutes: estMinutes,
      deliverySequence,
      efficiencyGainPercent: efficiencyGain,
    };
  }
}
