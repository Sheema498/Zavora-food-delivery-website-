import { describe, it, expect } from 'vitest';
import { FraudDetector } from '../domain/security/fraudDetector.js';

describe('Fraud Detection & Telemetry Verification', () => {
  it('should detect impossible GPS jump exceeding 130 km/h in urban delivery', () => {
    const prev = { latitude: 12.9784, longitude: 77.6408 };
    const next = { latitude: 12.9063, longitude: 77.5857 }; // ~10 km away
    const timeDeltaSeconds = 30; // 30 seconds -> 1200 km/h jump

    const result = FraudDetector.evaluateGpsTelemetry(prev, next, timeDeltaSeconds);
    expect(result.isSuspicious).toBe(true);
    expect(result.threatLevel).toBe('CRITICAL');
    expect(result.recommendedAction).toBe('BLOCK_TRANSACTION');
  });

  it('should pass normal city driving speed (25 km/h)', () => {
    const prev = { latitude: 12.9784, longitude: 77.6408 };
    const next = { latitude: 12.9752, longitude: 77.6455 }; // ~0.6 km
    const timeDeltaSeconds = 120; // 2 mins -> ~18 km/h

    const result = FraudDetector.evaluateGpsTelemetry(prev, next, timeDeltaSeconds);
    expect(result.isSuspicious).toBe(false);
    expect(result.threatLevel).toBe('NONE');
  });
});
