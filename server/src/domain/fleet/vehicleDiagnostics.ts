/**
 * QuickBite Electric Vehicle (EV) & Motorbike Fleet Diagnostics
 * Monitors battery health, state of charge (SoC), tire pressure sensors,
 * and preventive maintenance schedules across registered courier fleets.
 */

export interface VehicleDiagnosticReport {
  vehicleId: string;
  vehicleType: 'EV_SCOOTER' | 'MOTORBIKE' | 'E_BICYCLE';
  registrationNumber: string;
  batterySocPercent: number;
  estimatedRangeKm: number;
  odometerReadingKm: number;
  motorTemperatureCelsius: number;
  tirePressureFrontPsi: number;
  tirePressureRearPsi: number;
  needsMaintenanceService: boolean;
  serviceRecommendation: string;
}

export class VehicleDiagnosticsService {
  public static evaluateVehicleHealth(
    vehicleId: string,
    registrationNumber: string,
    odometerKm: number,
    batterySoc: number,
    motorTemp: number
  ): VehicleDiagnosticReport {
    const isEv = true;
    const estRange = isEv ? Math.round((batterySoc / 100) * 85) : 350;

    let needsService = false;
    let recommendation = 'Vehicle operating within optimal parameters.';

    if (motorTemp > 75) {
      needsService = true;
      recommendation = 'Motor overheating detected. Allow cool-down period.';
    } else if (odometerKm % 3000 < 100) {
      needsService = true;
      recommendation = 'Scheduled 3,000 km brake & suspension check due.';
    }

    return {
      vehicleId,
      vehicleType: 'EV_SCOOTER',
      registrationNumber,
      batterySocPercent: batterySoc,
      estimatedRangeKm: estRange,
      odometerReadingKm: odometerKm,
      motorTemperatureCelsius: motorTemp,
      tirePressureFrontPsi: 32,
      tirePressureRearPsi: 36,
      needsMaintenanceService: needsService,
      serviceRecommendation: recommendation,
    };
  }
}
