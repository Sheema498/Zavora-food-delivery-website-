/**
 * QuickBite Cold Chain & Food Temperature Safety Monitoring
 * Tracks real-time temperature telemetry for refrigerated food delivery bags,
 * dairy and seafood shipments, and flags temperature excursion breaches.
 */

export interface TemperatureReading {
  sensorId: string;
  tripId: string;
  timestamp: string;
  temperatureCelsius: number;
  humidityPercent: number;
  batteryLevelPercent: number;
  isExcursionDetected: boolean;
}

export interface FoodSafetyAudit {
  foodCategory: 'SEAFOOD' | 'DAIRY' | 'MEAT' | 'HOT_COOKED_MEAL' | 'FROZEN_DESSERT';
  targetMinTempCelsius: number;
  targetMaxTempCelsius: number;
  readings: TemperatureReading[];
  complianceScorePercent: number;
  safetyStatus: 'SAFE' | 'WARNING' | 'COMPROMISED_DISCARD';
}

export class ColdChainMonitorService {
  public static evaluateTripReadings(
    foodCategory: FoodSafetyAudit['foodCategory'],
    readings: TemperatureReading[]
  ): FoodSafetyAudit {
    let minTarget = 0;
    let maxTarget = 65;

    switch (foodCategory) {
      case 'FROZEN_DESSERT':
        minTarget = -22;
        maxTarget = -12;
        break;
      case 'SEAFOOD':
      case 'DAIRY':
      case 'MEAT':
        minTarget = 0;
        maxTarget = 4;
        break;
      case 'HOT_COOKED_MEAL':
        minTarget = 60;
        maxTarget = 85;
        break;
    }

    if (readings.length === 0) {
      return {
        foodCategory,
        targetMinTempCelsius: minTarget,
        targetMaxTempCelsius: maxTarget,
        readings: [],
        complianceScorePercent: 100,
        safetyStatus: 'SAFE',
      };
    }

    const compliantCount = readings.filter(
      (r) => r.temperatureCelsius >= minTarget && r.temperatureCelsius <= maxTarget
    ).length;

    const compliancePercent = Number(((compliantCount / readings.length) * 100).toFixed(1));

    let status: FoodSafetyAudit['safetyStatus'] = 'SAFE';
    if (compliancePercent < 70) {
      status = 'COMPROMISED_DISCARD';
    } else if (compliancePercent < 90) {
      status = 'WARNING';
    }

    return {
      foodCategory,
      targetMinTempCelsius: minTarget,
      targetMaxTempCelsius: maxTarget,
      readings,
      complianceScorePercent: compliancePercent,
      safetyStatus: status,
    };
  }
}
