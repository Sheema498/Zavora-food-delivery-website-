import { describe, it, expect } from 'vitest';
import { ColdChainMonitorService, TemperatureReading } from '../domain/supplyChain/coldChainMonitor.js';

describe('Cold Chain Food Safety Evaluation', () => {
  it('should flag excursion when hot food drops below 60C safe holding threshold', () => {
    const readings: TemperatureReading[] = [
      { sensorId: 's1', tripId: 't1', timestamp: new Date().toISOString(), temperatureCelsius: 68, humidityPercent: 40, batteryLevelPercent: 90, isExcursionDetected: false },
      { sensorId: 's1', tripId: 't1', timestamp: new Date().toISOString(), temperatureCelsius: 45, humidityPercent: 40, batteryLevelPercent: 90, isExcursionDetected: true },
    ];
    const audit = ColdChainMonitorService.evaluateTripReadings('HOT_COOKED_MEAL', readings);
    expect(audit.safetyStatus).toBe('COMPROMISED_DISCARD');
  });

  it('should pass cold dairy audit when kept at 2C to 4C', () => {
    const readings: TemperatureReading[] = [
      { sensorId: 's2', tripId: 't2', timestamp: new Date().toISOString(), temperatureCelsius: 3.2, humidityPercent: 50, batteryLevelPercent: 95, isExcursionDetected: false },
      { sensorId: 's2', tripId: 't2', timestamp: new Date().toISOString(), temperatureCelsius: 2.8, humidityPercent: 50, batteryLevelPercent: 95, isExcursionDetected: false },
    ];
    const audit = ColdChainMonitorService.evaluateTripReadings('DAIRY', readings);
    expect(audit.safetyStatus).toBe('SAFE');
    expect(audit.complianceScorePercent).toBe(100);
  });
});
