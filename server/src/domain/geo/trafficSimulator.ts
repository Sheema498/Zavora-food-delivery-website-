/**
 * QuickBite Urban Traffic & Environmental Congestion Simulator
 * Simulates real-time peak hour surges, weather conditions, bottleneck zones,
 * and delivery speed modifiers for accurate dynamic ETA projections.
 */

export type WeatherCondition = 'CLEAR' | 'LIGHT_RAIN' | 'HEAVY_MONSOON' | 'FOGGY' | 'HEATWAVE';

export interface TrafficStatus {
  timestamp: string;
  hourOfDay: number;
  isPeakHour: boolean;
  overallCongestionLevel: 'LOW' | 'MODERATE' | 'HEAVY' | 'GRIDLOCK';
  congestionMultiplier: number;
  weatherCondition: WeatherCondition;
  weatherMultiplier: number;
  zoneMultipliers: Record<string, number>;
  activeRoadIncidents: RoadIncident[];
}

export interface RoadIncident {
  id: string;
  roadName: string;
  zone: string;
  incidentType: 'ROAD_CONSTRUCTION' | 'METRO_WORK' | 'WATERLOGGING' | 'TRAFFIC_SIGNAL_DELAY';
  delayMinutes: number;
  description: string;
}

export class TrafficSimulator {
  private static currentWeather: WeatherCondition = 'CLEAR';
  private static activeIncidents: RoadIncident[] = [
    {
      id: 'inc-1',
      roadName: 'Intermediate Ring Road near Domlur Flyover',
      zone: 'Indiranagar',
      incidentType: 'METRO_WORK',
      delayMinutes: 6,
      description: 'Phase 3 Metro construction occupying one service lane',
    },
    {
      id: 'inc-2',
      roadName: 'Outer Ring Road Bellandur Flyover',
      zone: 'Bellandur',
      incidentType: 'ROAD_CONSTRUCTION',
      delayMinutes: 8,
      description: 'Asphalt resurfacing ongoing between 11 PM and 5 AM',
    },
  ];

  /**
   * Compute traffic multipliers based on current system time or simulated hour
   */
  public static getCurrentTrafficStatus(simulatedHour?: number): TrafficStatus {
    const now = new Date();
    const hour = simulatedHour !== undefined ? simulatedHour : now.getHours() + now.getMinutes() / 60;

    let baseMultiplier = 1.0;
    let isPeak = false;
    let level: 'LOW' | 'MODERATE' | 'HEAVY' | 'GRIDLOCK' = 'LOW';

    // Morning Peak: 8:30 AM to 11:00 AM
    if (hour >= 8.5 && hour <= 11.0) {
      baseMultiplier = 1.6;
      isPeak = true;
      level = 'HEAVY';
    }
    // Lunch Rush: 12:30 PM to 2:45 PM
    else if (hour >= 12.5 && hour <= 14.75) {
      baseMultiplier = 1.45;
      isPeak = true;
      level = 'MODERATE';
    }
    // Evening Rush: 5:30 PM to 9:30 PM (Peak Dinner)
    else if (hour >= 17.5 && hour <= 21.5) {
      baseMultiplier = 1.85;
      isPeak = true;
      level = 'HEAVY';
    }
    // Late Night: 11:00 PM to 6:00 AM
    else if (hour >= 23.0 || hour < 6.0) {
      baseMultiplier = 0.85;
      isPeak = false;
      level = 'LOW';
    } else {
      baseMultiplier = 1.15;
      isPeak = false;
      level = 'MODERATE';
    }

    // Weather impact
    let weatherMult = 1.0;
    switch (this.currentWeather) {
      case 'LIGHT_RAIN':
        weatherMult = 1.25;
        break;
      case 'HEAVY_MONSOON':
        weatherMult = 1.7;
        level = 'GRIDLOCK';
        break;
      case 'FOGGY':
        weatherMult = 1.15;
        break;
      default:
        weatherMult = 1.0;
    }

    const zoneMultipliers: Record<string, number> = {
      Indiranagar: Number((baseMultiplier * 1.1).toFixed(2)),
      Koramangala: Number((baseMultiplier * 1.2).toFixed(2)),
      CBD: Number((baseMultiplier * 1.25).toFixed(2)),
      'HSR Layout': Number((baseMultiplier * 1.05).toFixed(2)),
      Bellandur: Number((baseMultiplier * 1.35).toFixed(2)),
      Whitefield: Number((baseMultiplier * 1.3).toFixed(2)),
    };

    return {
      timestamp: now.toISOString(),
      hourOfDay: Number(hour.toFixed(2)),
      isPeakHour: isPeak,
      overallCongestionLevel: level,
      congestionMultiplier: Number(baseMultiplier.toFixed(2)),
      weatherCondition: this.currentWeather,
      weatherMultiplier: Number(weatherMult.toFixed(2)),
      zoneMultipliers,
      activeRoadIncidents: this.activeIncidents,
    };
  }

  /**
   * Set simulated weather condition (e.g. to test rain surge pricing & delivery SLAs)
   */
  public static setWeather(weather: WeatherCondition): void {
    this.currentWeather = weather;
  }

  /**
   * Calculate surge pricing multiplier based on demand and traffic
   */
  public static calculateSurgeMultiplier(activeOrderVolume: number, onlineDrivers: number): number {
    if (onlineDrivers <= 0) return 2.0;

    const ratio = activeOrderVolume / onlineDrivers;
    if (ratio > 3.0) return 1.8;
    if (ratio > 2.0) return 1.4;
    if (ratio > 1.2) return 1.15;
    return 1.0;
  }
}
