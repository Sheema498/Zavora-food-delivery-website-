"""
QuickBite Enterprise Domain Module Generator - Comprehensive Expansion
Generates domain modules across Supply Chain, Geofencing, Analytics, Tests, and Client Components.
"""

import os
import json

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.join(ROOT_DIR, 'server', 'src')
CLIENT_DIR = os.path.join(ROOT_DIR, 'client', 'src')

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def generate_supply_chain_modules():
    out_dir = os.path.join(SERVER_DIR, 'domain', 'supplyChain')
    ensure_dir(out_dir)

    # 1. Cold Chain Monitoring
    with open(os.path.join(out_dir, 'coldChainMonitor.ts'), 'w', encoding='utf-8') as f:
        f.write('''/**
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
''')

    # 2. Supplier Vendor Management
    with open(os.path.join(out_dir, 'vendorContracts.ts'), 'w', encoding='utf-8') as f:
        f.write('''/**
 * QuickBite Raw Material & Supplier Vendor Contract Manager
 * Tracks commercial vendor terms, minimum purchase quantities (MOQ),
 * delivery lead times, credit periods, and quality inspection ratings.
 */

export interface SupplierVendor {
  vendorId: string;
  companyName: string;
  category: 'FRESH_PRODUCE' | 'DAIRY_POULTRY' | 'SPICES_OILS' | 'PACKAGING_BOXES' | 'BEVERAGES';
  contactPerson: string;
  phone: string;
  city: string;
  leadTimeHours: number;
  minimumOrderValue: number;
  qualityRating: number;
  paymentTermsDays: number;
  isActive: boolean;
}

export const REGISTERED_SUPPLIERS: SupplierVendor[] = [
  {
    vendorId: 'sup-01',
    companyName: 'FarmFresh Organic Farms Pvt Ltd',
    category: 'FRESH_PRODUCE',
    contactPerson: 'Ramesh Patel',
    phone: '+91 98450 11223',
    city: 'Bengaluru Rural',
    leadTimeHours: 12,
    minimumOrderValue: 2500,
    qualityRating: 4.9,
    paymentTermsDays: 15,
    isActive: true,
  },
  {
    vendorId: 'sup-02',
    companyName: 'Royal Dairy & Artisan Cheese Co',
    category: 'DAIRY_POULTRY',
    contactPerson: 'Sunil Verghese',
    phone: '+91 98451 44556',
    city: 'Hosur',
    leadTimeHours: 8,
    minimumOrderValue: 4000,
    qualityRating: 4.8,
    paymentTermsDays: 7,
    isActive: true,
  },
  {
    vendorId: 'sup-03',
    companyName: 'EcoPack Tamper-Proof Packaging Solutions',
    category: 'PACKAGING_BOXES',
    contactPerson: 'Anita Rao',
    phone: '+91 98452 77889',
    city: 'Peenya Industrial Area, Bengaluru',
    leadTimeHours: 24,
    minimumOrderValue: 5000,
    qualityRating: 4.9,
    paymentTermsDays: 30,
    isActive: true,
  },
];
''')

def generate_geofencing_modules():
    out_dir = os.path.join(SERVER_DIR, 'domain', 'geo')
    ensure_dir(out_dir)

    with open(os.path.join(out_dir, 'geofencingEngine.ts'), 'w', encoding='utf-8') as f:
        f.write('''/**
 * QuickBite Polygon Geofencing & Serviceability Engine
 * Performs ray-casting point-in-polygon tests to determine if a customer delivery
 * address falls within a restaurant's licensed operating boundary or restricted zones.
 */

import { GeoCoordinate } from './metroGraph.js';

export interface PolygonBoundary {
  polygonId: string;
  zoneName: string;
  vertices: GeoCoordinate[];
  maxDeliveryRadiusKm: number;
  isServiceable: boolean;
}

export class GeofencingEngine {
  /**
   * Ray-casting algorithm to test if a point lies inside a 2D polygon
   */
  public static isPointInPolygon(point: GeoCoordinate, vertices: GeoCoordinate[]): boolean {
    if (vertices.length < 3) return false;

    let inside = false;
    const x = point.longitude;
    const y = point.latitude;

    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].longitude;
      const yi = vertices[i].latitude;
      const xj = vertices[j].longitude;
      const yj = vertices[j].latitude;

      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Check if customer coordinate is serviceable by restaurant delivery polygon
   */
  public static checkServiceability(
    customerLocation: GeoCoordinate,
    boundary: PolygonBoundary
  ): { isServiceable: boolean; reason?: string } {
    if (!boundary.isServiceable) {
      return { isServiceable: false, reason: `Zone ${boundary.zoneName} is temporarily non-serviceable.` };
    }

    const inside = this.isPointInPolygon(customerLocation, boundary.vertices);
    if (!inside) {
      return {
        isServiceable: false,
        reason: `Address is outside the delivery boundary for ${boundary.zoneName}.`,
      };
    }

    return { isServiceable: true };
  }
}
''')

def generate_test_suites():
    out_dir = os.path.join(SERVER_DIR, '__tests__')
    ensure_dir(out_dir)

    test_modules = [
        ("coldChain", "Cold Chain Food Safety Tests", '''
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
'''),
        ("geofencing", "Polygon Geofencing Serviceability Tests", '''
import { describe, it, expect } from 'vitest';
import { GeofencingEngine, PolygonBoundary } from '../domain/geo/geofencingEngine.js';

describe('Geofencing Polygon Ray-Casting', () => {
  const boundary: PolygonBoundary = {
    polygonId: 'poly-1',
    zoneName: 'Indiranagar Zone',
    maxDeliveryRadiusKm: 5.0,
    isServiceable: true,
    vertices: [
      { latitude: 12.9700, longitude: 77.6300 },
      { latitude: 12.9900, longitude: 77.6300 },
      { latitude: 12.9900, longitude: 77.6500 },
      { latitude: 12.9700, longitude: 77.6500 },
    ],
  };

  it('should accept customer coordinate inside boundary square', () => {
    const insidePoint = { latitude: 12.9800, longitude: 77.6400 };
    const res = GeofencingEngine.checkServiceability(insidePoint, boundary);
    expect(res.isServiceable).toBe(true);
  });

  it('should reject customer coordinate outside boundary square', () => {
    const outsidePoint = { latitude: 12.9100, longitude: 77.6000 };
    const res = GeofencingEngine.checkServiceability(outsidePoint, boundary);
    expect(res.isServiceable).toBe(false);
  });
});
'''),
        ("fraudDetector", "Fraud & Teleportation Detection Tests", '''
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
'''),
        ("surgeEngine", "Dynamic Surge & Fleet Balance Tests", '''
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
'''),
        ("nutrition", "Macronutrient & Allergen Profile Tests", '''
import { describe, it, expect } from 'vitest';
import { NutritionCalculatorService } from '../domain/nutrition/nutritionCalculator.js';

describe('Nutrition & Calorie Calculations', () => {
  it('should compute macros and health score for balanced dish', () => {
    const ingredients = [
      { name: 'Grilled Chicken Breast', weightGrams: 150, caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0, sodiumMgPer100g: 74, isAnimalProduct: true },
      { name: 'Steamed Brown Rice', weightGrams: 100, caloriesPer100g: 111, proteinPer100g: 2.6, carbsPer100g: 23, fatPer100g: 0.9, fiberPer100g: 1.8, sodiumMgPer100g: 5 },
      { name: 'Broccoli Florets', weightGrams: 80, caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4, fiberPer100g: 2.6, sodiumMgPer100g: 33 },
    ];

    const report = NutritionCalculatorService.calculateNutritionReport('dish-1', 'Fit Protein Bowl', 330, ingredients);
    expect(report.macros.caloriesKcal).toBeGreaterThan(300);
    expect(report.macros.proteinGrams).toBeGreaterThan(45);
    expect(report.certifications.isVegetarian).toBe(false);
    expect(report.healthScoreOutOf100).toBeGreaterThan(80);
  });
});
'''),
    ]

    for name, title, code in test_modules:
        file_path = os.path.join(out_dir, f"{name}.test.ts")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code.strip() + '\n')

def generate_client_visualizers():
    out_dir = os.path.join(CLIENT_DIR, 'components', 'analytics')
    ensure_dir(out_dir)

    # 1. Kitchen Velocity Visualizer Component
    with open(os.path.join(out_dir, 'KitchenVelocityVisualizer.tsx'), 'w', encoding='utf-8') as f:
        f.write('''import React from 'react';
import { Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface KitchenVelocityProps {
  restaurantName: string;
  avgPrepMinutes: number;
  targetPrepMinutes: number;
  onTimePercent: number;
  activeOrdersCount: number;
}

export const KitchenVelocityVisualizer: React.FC<KitchenVelocityProps> = ({
  restaurantName,
  avgPrepMinutes,
  targetPrepMinutes,
  onTimePercent,
  activeOrdersCount,
}) => {
  const isHealthy = avgPrepMinutes <= targetPrepMinutes + 3;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{restaurantName} — Velocity Index</h3>
          <p className="text-xs text-slate-500">Live prep speed & kitchen load analytics</p>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
            isHealthy ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {isHealthy ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {isHealthy ? 'Peak Efficiency' : 'High Prep Load'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-slate-50 rounded-2xl">
          <span className="text-slate-400 block mb-1">Avg Cooking Time</span>
          <span className="text-lg font-black text-slate-900">{avgPrepMinutes} Mins</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Target: {targetPrepMinutes} Mins</span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl">
          <span className="text-slate-400 block mb-1">On-Time Prep Rate</span>
          <span className="text-lg font-black text-emerald-600">{onTimePercent}%</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">SLA Target: 90%+</span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl">
          <span className="text-slate-400 block mb-1">Active Cooking Woks</span>
          <span className="text-lg font-black text-brand-600">{activeOrdersCount} Orders</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Simultaneous Prep</span>
        </div>
      </div>
    </div>
  );
};
''')

    # 2. Nutrition Label Component
    with open(os.path.join(out_dir, 'NutritionLabelCard.tsx'), 'w', encoding='utf-8') as f:
        f.write('''import React from 'react';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

interface NutritionProps {
  dishName: string;
  caloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  dietaryFiberGrams: number;
  healthScore: number;
}

export const NutritionLabelCard: React.FC<NutritionProps> = ({
  dishName,
  caloriesKcal,
  proteinGrams,
  carbsGrams,
  fatsGrams,
  dietaryFiberGrams,
  healthScore,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 max-w-sm">
      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
        <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">Nutrition Facts</h4>
        <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">QuickBite Certified</span>
      </div>

      <div className="space-y-1 text-xs">
        <p className="font-bold text-slate-900">{dishName}</p>
        <div className="flex justify-between items-baseline border-b-4 border-slate-900 pb-1">
          <span className="font-bold text-slate-700">Amount Per Serving</span>
          <span className="text-lg font-black text-slate-900">{caloriesKcal} Calories</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
        <div className="py-1.5 flex justify-between">
          <span><strong>Total Fat</strong> {fatsGrams}g</span>
          <span className="font-bold text-slate-900">{Math.round((fatsGrams / 65) * 100)}% DV</span>
        </div>
        <div className="py-1.5 flex justify-between">
          <span><strong>Total Carbohydrates</strong> {carbsGrams}g</span>
          <span className="font-bold text-slate-900">{Math.round((carbsGrams / 300) * 100)}% DV</span>
        </div>
        <div className="py-1.5 flex justify-between">
          <span className="pl-4 text-slate-500">Dietary Fiber {dietaryFiberGrams}g</span>
          <span className="font-bold text-slate-900">{Math.round((dietaryFiberGrams / 25) * 100)}% DV</span>
        </div>
        <div className="py-1.5 flex justify-between">
          <span><strong>Protein</strong> {proteinGrams}g</span>
          <span className="font-bold text-emerald-600">{Math.round((proteinGrams / 50) * 100)}% DV</span>
        </div>
      </div>

      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
          <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" /> Health Score
        </div>
        <span className="font-black text-emerald-700 text-sm">{healthScore} / 100</span>
      </div>
    </div>
  );
};
''')

if __name__ == '__main__':
    generate_supply_chain_modules()
    generate_geofencing_modules()
    generate_test_suites()
    generate_client_visualizers()
    print("Supply chain, geofencing, test suites, and client visualizers generated successfully.")
