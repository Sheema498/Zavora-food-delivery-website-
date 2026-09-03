/**
 * QuickBite Automated Courier Dispatch Optimizer
 * Computes optimal bipartite assignment pairings between pending restaurant orders
 * and available active delivery partners using multi-objective scoring.
 */

import { GeoCoordinate } from '../geo/metroGraph.js';
import { calculateHaversineDistanceKm } from '../../utils/geo.utils.js';

export interface DispatchCandidateOrder {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  restaurantLocation: GeoCoordinate;
  customerLocation: GeoCoordinate;
  readySinceMinutes: number;
  isPriority: boolean;
}

export interface DispatchCandidateDriver {
  deliveryPartnerId: string;
  driverName: string;
  currentLocation: GeoCoordinate;
  rating: number;
  vehicleType: string;
  activeDeliveriesCount: number;
  completedTodayCount: number;
}

export interface MatchResult {
  orderId: string;
  orderNumber: string;
  deliveryPartnerId: string;
  driverName: string;
  pickupDistanceKm: number;
  estimatedPickupMinutes: number;
  matchScore: number; // 0 to 100
  rationale: string;
}

export class DispatchOptimizer {
  /**
   * Score a pairing between a driver and an order (Higher score = Better match)
   */
  public static calculateMatchScore(
    order: DispatchCandidateOrder,
    driver: DispatchCandidateDriver
  ): { score: number; distanceKm: number; etaMinutes: number; rationale: string } {
    const distanceKm = calculateHaversineDistanceKm(
      driver.currentLocation.latitude,
      driver.currentLocation.longitude,
      order.restaurantLocation.latitude,
      order.restaurantLocation.longitude
    );

    // Speed: ~25 km/h in city
    const etaMinutes = Math.max(2, Math.round((distanceKm / 25) * 60));

    // Distance component (Max 50 points, 0km = 50, 5km = 20, 10km+ = 0)
    const distanceScore = Math.max(0, 50 - distanceKm * 5);

    // Rating component (Max 20 points, 5.0 rating = 20)
    const ratingScore = Math.min(20, (driver.rating / 5.0) * 20);

    // Wait-time urgency component (Max 20 points, orders waiting longer get boost)
    const urgencyScore = Math.min(20, order.readySinceMinutes * 2);

    // Load balancing penalty (-15 points per existing active order)
    const loadPenalty = driver.activeDeliveriesCount * 15;

    // Vehicle bonus (Motorbike preferred for mid distance)
    const vehicleBonus = driver.vehicleType === 'MOTORBIKE' || driver.vehicleType === 'SCOOTER' ? 10 : 5;

    const totalScore = Math.max(
      0,
      Math.min(100, distanceScore + ratingScore + urgencyScore + vehicleBonus - loadPenalty)
    );

    const rationale = `Dist: ${distanceKm.toFixed(1)}km, Rating: ${driver.rating}★, Wait: ${order.readySinceMinutes}m, Vehicle: ${driver.vehicleType}`;

    return {
      score: Number(totalScore.toFixed(1)),
      distanceKm: Number(distanceKm.toFixed(2)),
      etaMinutes,
      rationale,
    };
  }

  /**
   * Find the single best driver for a given ready order
   */
  public static findBestDriverForOrder(
    order: DispatchCandidateOrder,
    availableDrivers: DispatchCandidateDriver[],
    maxRadiusKm = 10.0
  ): MatchResult | null {
    const candidates = availableDrivers.filter((d) => d.activeDeliveriesCount < 2);
    if (candidates.length === 0) return null;

    let bestMatch: MatchResult | null = null;
    let highestScore = -1;

    for (const driver of candidates) {
      const match = this.calculateMatchScore(order, driver);
      if (match.distanceKm <= maxRadiusKm && match.score > highestScore) {
        highestScore = match.score;
        bestMatch = {
          orderId: order.orderId,
          orderNumber: order.orderNumber,
          deliveryPartnerId: driver.deliveryPartnerId,
          driverName: driver.driverName,
          pickupDistanceKm: match.distanceKm,
          estimatedPickupMinutes: match.etaMinutes,
          matchScore: match.score,
          rationale: match.rationale,
        };
      }
    }

    return bestMatch;
  }

  /**
   * Solve bipartite matching for multiple orders to multiple drivers (Greedy Global Optimization)
   */
  public static matchOrdersToDrivers(
    orders: DispatchCandidateOrder[],
    drivers: DispatchCandidateDriver[]
  ): MatchResult[] {
    const matchedDrivers: Set<string> = new Set();
    const results: MatchResult[] = [];

    // Sort orders by urgency (oldest first)
    const sortedOrders = [...orders].sort((a, b) => b.readySinceMinutes - a.readySinceMinutes);

    for (const order of sortedOrders) {
      const remainingDrivers = drivers.filter(
        (d) => !matchedDrivers.has(d.deliveryPartnerId) && d.activeDeliveriesCount === 0
      );

      const match = this.findBestDriverForOrder(order, remainingDrivers);
      if (match) {
        results.push(match);
        matchedDrivers.add(match.deliveryPartnerId);
      }
    }

    return results;
  }
}
