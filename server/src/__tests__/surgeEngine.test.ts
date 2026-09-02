import { describe, it, expect } from 'vitest';
import { SurgeEngine } from '../domain/analytics/surgeEngine.js';

describe('Dynamic Surge Pricing Engine', () => {
  it('should apply weather surge multiplier when raining', () => {
    const surge = SurgeEngine.evaluateZoneSurge('z1', 'Koramangala', 10, 10, true);
    expect(surge.surgeMultiplier).toBe(1.6);
    expect(surge.surgeReason).toBe('WEATHER_MONSOON_SURGE');
    expect(surge.driverIncentiveBonusAmount).toBe(30.0);
  });

  it('should apply standard pricing when supply matches demand', () => {
    const surge = SurgeEngine.evaluateZoneSurge('z1', 'Koramangala', 5, 10, false);
    expect(surge.surgeMultiplier).toBe(1.0);
    expect(surge.surgeReason).toBe('STANDARD_PRICING');
  });
});
