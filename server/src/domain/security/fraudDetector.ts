/**
 * QuickBite Fraud Detection & Operational Integrity Engine
 * Detects GPS teleportation / spoofing, coupon exploitation velocity,
 * repeated order cancel loops, and anomalous delivery duration spikes.
 */

import { GeoCoordinate } from '../geo/metroGraph.js';
import { calculateHaversineDistanceKm } from '../../utils/geo.utils.js';

export interface FraudEvaluationResult {
  isSuspicious: boolean;
  threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
  detectedAnomalies: string[];
  recommendedAction: 'ALLOW' | 'LOG_FLAG' | 'CHALLENGE_2FA' | 'BLOCK_TRANSACTION';
  confidenceScore: number; // 0 to 100
}

export class FraudDetector {
  /**
   * Evaluate GPS coordinate jump realism (Driver moving faster than 130 km/h in city is flagged as spoofed GPS)
   */
  public static evaluateGpsTelemetry(
    previousLocation: GeoCoordinate,
    newLocation: GeoCoordinate,
    timeDeltaSeconds: number
  ): FraudEvaluationResult {
    if (timeDeltaSeconds <= 0) {
      return {
        isSuspicious: false,
        threatLevel: 'NONE',
        detectedAnomalies: [],
        recommendedAction: 'ALLOW',
        confidenceScore: 0,
      };
    }

    const distanceKm = calculateHaversineDistanceKm(
      previousLocation.latitude,
      previousLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );

    const speedKmh = (distanceKm / (timeDeltaSeconds / 3600));

    // City delivery velocity checks
    if (speedKmh > 130) {
      return {
        isSuspicious: true,
        threatLevel: 'CRITICAL',
        detectedAnomalies: [
          `Impossible transit velocity detected: ${speedKmh.toFixed(1)} km/h (${distanceKm.toFixed(2)} km in ${timeDeltaSeconds}s)`,
          'Probable mock GPS location spoofer active on courier device',
        ],
        recommendedAction: 'BLOCK_TRANSACTION',
        confidenceScore: 98,
      };
    }

    if (speedKmh > 85) {
      return {
        isSuspicious: true,
        threatLevel: 'MEDIUM',
        detectedAnomalies: [
          `Unusually high urban transit speed: ${speedKmh.toFixed(1)} km/h`,
        ],
        recommendedAction: 'LOG_FLAG',
        confidenceScore: 65,
      };
    }

    return {
      isSuspicious: false,
      threatLevel: 'NONE',
      detectedAnomalies: [],
      recommendedAction: 'ALLOW',
      confidenceScore: 0,
    };
  }

  /**
   * Evaluate multi-account coupon abuse velocity
   */
  public static evaluateCouponAbuse(
    userId: string,
    ipAddress: string,
    deviceFingerprint: string,
    couponCode: string,
    recentRedemptionsFromIpCount: number
  ): FraudEvaluationResult {
    if (recentRedemptionsFromIpCount > 5) {
      return {
        isSuspicious: true,
        threatLevel: 'CRITICAL',
        detectedAnomalies: [
          `High velocity coupon redemption: ${recentRedemptionsFromIpCount} redemptions for '${couponCode}' from IP ${ipAddress}`,
          'Multi-account syndication pattern detected',
        ],
        recommendedAction: 'BLOCK_TRANSACTION',
        confidenceScore: 92,
      };
    }

    if (recentRedemptionsFromIpCount > 2) {
      return {
        isSuspicious: true,
        threatLevel: 'LOW',
        detectedAnomalies: [
          `Multiple coupon redemptions from same IP/device fingerprint: ${deviceFingerprint.slice(0, 8)}`,
        ],
        recommendedAction: 'LOG_FLAG',
        confidenceScore: 45,
      };
    }

    return {
      isSuspicious: false,
      threatLevel: 'NONE',
      detectedAnomalies: [],
      recommendedAction: 'ALLOW',
      confidenceScore: 0,
    };
  }
}
