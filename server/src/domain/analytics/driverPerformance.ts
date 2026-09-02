/**
 * QuickBite Courier Performance & SLA Intelligence Service
 * Computes on-time delivery rates, speed efficiency, customer tip yields,
 * and delivery partner safety compliance indices.
 */

export interface DriverPerformanceScorecard {
  deliveryPartnerId: string;
  driverName: string;
  totalDeliveriesCompleted: number;
  onTimeDeliveryRatePercent: number;
  averageTransitMinutesPerKm: number;
  customerSatisfactionRating: number;
  totalTipsEarned: number;
  averageTipPerDelivery: number;
  acceptanceRatePercent: number;
  qualityTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'STANDARD';
  incentiveBonusEarned: number;
}

export class DriverPerformanceService {
  /**
   * Generate comprehensive scorecard for a delivery partner
   */
  public static generateScorecard(
    deliveryPartnerId: string,
    driverName: string,
    trips: Array<{
      orderId: string;
      distanceKm: number;
      transitDurationMinutes: number;
      targetDurationMinutes: number;
      tipAmount: number;
      isAccepted: boolean;
    }>,
    rating = 4.8
  ): DriverPerformanceScorecard {
    if (trips.length === 0) {
      return {
        deliveryPartnerId,
        driverName,
        totalDeliveriesCompleted: 0,
        onTimeDeliveryRatePercent: 100,
        averageTransitMinutesPerKm: 2.4,
        customerSatisfactionRating: rating,
        totalTipsEarned: 0,
        averageTipPerDelivery: 0,
        acceptanceRatePercent: 100,
        qualityTier: 'STANDARD',
        incentiveBonusEarned: 0,
      };
    }

    const acceptedTrips = trips.filter((t) => t.isAccepted);
    const acceptanceRate = Number(((acceptedTrips.length / trips.length) * 100).toFixed(1));

    const onTimeTrips = acceptedTrips.filter(
      (t) => t.transitDurationMinutes <= t.targetDurationMinutes + 2
    );
    const onTimeRate = Number(((onTimeTrips.length / acceptedTrips.length) * 100).toFixed(1));

    const totalDistance = acceptedTrips.reduce((sum, t) => sum + t.distanceKm, 0);
    const totalTransitMinutes = acceptedTrips.reduce((sum, t) => sum + t.transitDurationMinutes, 0);
    const paceMinPerKm = totalDistance > 0 ? Number((totalTransitMinutes / totalDistance).toFixed(1)) : 2.4;

    const totalTips = acceptedTrips.reduce((sum, t) => sum + t.tipAmount, 0);
    const avgTip = acceptedTrips.length > 0 ? Number((totalTips / acceptedTrips.length).toFixed(1)) : 0;

    let tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'STANDARD' = 'STANDARD';
    let bonus = 0;

    if (acceptedTrips.length >= 25 && onTimeRate >= 95 && rating >= 4.8) {
      tier = 'PLATINUM';
      bonus = 750.0;
    } else if (acceptedTrips.length >= 15 && onTimeRate >= 90 && rating >= 4.6) {
      tier = 'GOLD';
      bonus = 400.0;
    } else if (acceptedTrips.length >= 5 && onTimeRate >= 80) {
      tier = 'SILVER';
      bonus = 150.0;
    }

    return {
      deliveryPartnerId,
      driverName,
      totalDeliveriesCompleted: acceptedTrips.length,
      onTimeDeliveryRatePercent: onTimeRate,
      averageTransitMinutesPerKm: paceMinPerKm,
      customerSatisfactionRating: rating,
      totalTipsEarned: totalTips,
      averageTipPerDelivery: avgTip,
      acceptanceRatePercent: acceptanceRate,
      qualityTier: tier,
      incentiveBonusEarned: bonus,
    };
  }
}
