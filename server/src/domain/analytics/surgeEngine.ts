/**
 * QuickBite Dynamic Surge Pricing & Fleet Balance Engine
 * Dynamically adjusts delivery logistics fees and driver incentive multipliers
 * based on live spatial supply-demand ratios in each urban sector.
 */

export interface ZoneSurgeState {
  zoneId: string;
  zoneName: string;
  activeUnassignedOrdersCount: number;
  availableOnlineDriversCount: number;
  supplyDemandRatio: number;
  surgeMultiplier: number;
  surgeReason: 'STANDARD_PRICING' | 'LUNCH_PEAK_RUSH' | 'DINNER_PEAK_RUSH' | 'WEATHER_MONSOON_SURGE' | 'COURIER_SHORTAGE';
  driverIncentiveBonusAmount: number;
  customerSurgeFeeAmount: number;
}

export class SurgeEngine {
  /**
   * Compute dynamic surge multiplier for a zone
   */
  public static evaluateZoneSurge(
    zoneId: string,
    zoneName: string,
    activeOrders: number,
    availableDrivers: number,
    isRaining = false
  ): ZoneSurgeState {
    const ratio = availableDrivers > 0 ? activeOrders / availableDrivers : activeOrders > 0 ? 5.0 : 0.0;

    let multiplier = 1.0;
    let reason: ZoneSurgeState['surgeReason'] = 'STANDARD_PRICING';
    let incentive = 0;
    let customerFee = 0;

    if (isRaining) {
      multiplier = 1.6;
      reason = 'WEATHER_MONSOON_SURGE';
      incentive = 30.0;
      customerFee = 25.0;
    } else if (ratio >= 3.0) {
      multiplier = 1.8;
      reason = 'COURIER_SHORTAGE';
      incentive = 40.0;
      customerFee = 35.0;
    } else if (ratio >= 2.0) {
      multiplier = 1.4;
      reason = 'DINNER_PEAK_RUSH';
      incentive = 20.0;
      customerFee = 15.0;
    } else if (ratio >= 1.2) {
      multiplier = 1.15;
      reason = 'LUNCH_PEAK_RUSH';
      incentive = 10.0;
      customerFee = 10.0;
    }

    return {
      zoneId,
      zoneName,
      activeUnassignedOrdersCount: activeOrders,
      availableOnlineDriversCount: availableDrivers,
      supplyDemandRatio: Number(ratio.toFixed(2)),
      surgeMultiplier: multiplier,
      surgeReason: reason,
      driverIncentiveBonusAmount: incentive,
      customerSurgeFeeAmount: customerFee,
    };
  }
}
