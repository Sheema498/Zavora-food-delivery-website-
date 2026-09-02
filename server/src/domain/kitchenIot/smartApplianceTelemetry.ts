/**
 * QuickBite Kitchen Smart IoT Appliance Telemetry
 * Monitors live temperatures and operational runtimes for commercial deck ovens,
 * tandoor clay pits, oil deep fryers, and blast chillers across restaurant kitchens.
 */

export interface ApplianceTelemetryReading {
  applianceId: string;
  restaurantId: string;
  applianceType: 'WOOD_FIRED_OVEN' | 'CLAY_TANDOOR' | 'COMMERCIAL_FRYER' | 'BLAST_CHILLER' | 'ESPRESSO_BOILER';
  currentTempCelsius: number;
  targetTempCelsius: number;
  oilDegradationTpmIndex?: number;
  powerConsumptionKw: number;
  operatingHoursToday: number;
  isReadyForCooking: boolean;
  maintenanceAlert?: string;
}

export class KitchenApplianceTelemetryService {
  public static evaluateAppliance(
    reading: ApplianceTelemetryReading
  ): { isReady: boolean; healthRating: 'OPTIMAL' | 'ATTENTION_REQUIRED' | 'SHUTDOWN_SERVICE' } {
    if (reading.oilDegradationTpmIndex && reading.oilDegradationTpmIndex > 24) {
      return { isReady: false, healthRating: 'SHUTDOWN_SERVICE' };
    }
    const tempDelta = Math.abs(reading.currentTempCelsius - reading.targetTempCelsius);
    if (tempDelta > 20) {
      return { isReady: false, healthRating: 'ATTENTION_REQUIRED' };
    }
    return { isReady: true, healthRating: 'OPTIMAL' };
  }
}
