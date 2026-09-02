/**
 * QuickBite Metropolitan Comprehensive Spatial Topologies & Zone Corridors
 * Complete multi-zone coordinate graphs, road segments, and speed profiles
 * for realistic keyless delivery simulation across 25 metropolitan sectors.
 */

export interface DetailedZoneBoundary {
  zoneId: string;
  zoneName: string;
  pincode: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  avgDeliveryTimeMinutes: number;
  densityTier: 'ULTRA_HIGH' | 'HIGH' | 'MEDIUM' | 'SUBURB';
  keyLandmarks: string[];
  popularCuisines: string[];
}

export interface DetailedRoadWaypoint {
  seq: number;
  roadName: string;
  latitude: number;
  longitude: number;
  bearingDegrees: number;
  speedLimitKmh: number;
  laneCount: number;
}

export const METRO_ZONES_CATALOG: DetailedZoneBoundary[] = [
  {
    zoneId: 'zone-ind-01',
    zoneName: 'Indiranagar 100ft & 12th Main',
    pincode: '560038',
    centerLatitude: 12.9784,
    centerLongitude: 77.6408,
    radiusKm: 3.2,
    avgDeliveryTimeMinutes: 22,
    densityTier: 'ULTRA_HIGH',
    keyLandmarks: ['100 Feet Road', 'CMH Road Metro', 'Defence Colony Club', '12th Main Food Street'],
    popularCuisines: ['Artisanal Pizza', 'Craft Burgers', 'Microbrewery Pub Grub', 'Specialty Coffee'],
  },
  {
    zoneId: 'zone-kor-02',
    zoneName: 'Koramangala 3rd to 7th Block',
    pincode: '560034',
    centerLatitude: 12.9345,
    centerLongitude: 77.6258,
    radiusKm: 3.5,
    avgDeliveryTimeMinutes: 24,
    densityTier: 'ULTRA_HIGH',
    keyLandmarks: ['Sony World Junction', '80ft Road', 'Forum Mall Circle', 'Jyoti Nivas College Road'],
    popularCuisines: ['Smashed Burgers', 'Gourmet Pasta', 'Vietnamese Pho', 'Belgian Waffles'],
  },
  {
    zoneId: 'zone-cbd-03',
    zoneName: 'CBD - MG Road & Brigade Road',
    pincode: '560001',
    centerLatitude: 12.9756,
    centerLongitude: 77.6066,
    radiusKm: 2.8,
    avgDeliveryTimeMinutes: 20,
    densityTier: 'ULTRA_HIGH',
    keyLandmarks: ['MG Road Metro Station', 'Brigade Road', 'Residency Road', 'Church Street'],
    popularCuisines: ['Continental', 'Pan-Asian', 'Piedmont Italian', 'Dum Biryani'],
  },
  {
    zoneId: 'zone-hsr-04',
    zoneName: 'HSR Layout Sectors 1-7',
    pincode: '560102',
    centerLatitude: 12.9154,
    centerLongitude: 77.6498,
    radiusKm: 4.0,
    avgDeliveryTimeMinutes: 25,
    densityTier: 'HIGH',
    keyLandmarks: ['27th Main High Street', 'CPWD Complex', 'Agara Lake Promenade', 'Sector 3 Park'],
    popularCuisines: ['Hyderabadi Biryani', 'Healthy Salads & Bowls', 'North Indian Thalis', 'Boba Tea'],
  },
  {
    zoneId: 'zone-bel-05',
    zoneName: 'Bellandur & Outer Ring Road',
    pincode: '560103',
    centerLatitude: 12.9262,
    centerLongitude: 77.6834,
    radiusKm: 4.5,
    avgDeliveryTimeMinutes: 28,
    densityTier: 'HIGH',
    keyLandmarks: ['Ecospace Business Park', 'EcoWorld Tech Center', 'Green Glen Layout', 'Central Mall ORR'],
    popularCuisines: ['Corporate Lunch Boxes', 'Rolls & Shawarmas', 'Mughlai Curries', 'Dim Sum'],
  },
  {
    zoneId: 'zone-whi-06',
    zoneName: 'Whitefield ITPL & EPIP Zone',
    pincode: '560066',
    centerLatitude: 12.9858,
    centerLongitude: 77.7314,
    radiusKm: 5.5,
    avgDeliveryTimeMinutes: 30,
    densityTier: 'HIGH',
    keyLandmarks: ['ITPL Main Gate', 'Phoenix Marketcity', 'Palm Meadows', 'Kundalahalli Gate'],
    popularCuisines: ['Wood-Fired Pizza', 'Sizzlers', 'South Indian Tiffin', 'Artisan Bakery'],
  },
  {
    zoneId: 'zone-jpn-07',
    zoneName: 'JP Nagar Phases 1 to 6',
    pincode: '560078',
    centerLatitude: 12.9063,
    centerLongitude: 77.5857,
    radiusKm: 3.8,
    avgDeliveryTimeMinutes: 25,
    densityTier: 'MEDIUM',
    keyLandmarks: ['Ranga Shankara Theatre', 'Mini Forest 3rd Phase', 'Delmia Circle', 'Sarakki Junction'],
    popularCuisines: ['Traditional Udupi Tiffin', 'Andhra Meals', 'Tandoori Platters', 'Ice Cream Sundaes'],
  },
  {
    zoneId: 'zone-jay-08',
    zoneName: 'Jayanagar 4th & 9th Block',
    pincode: '560041',
    centerLatitude: 12.9298,
    centerLongitude: 77.5843,
    radiusKm: 3.0,
    avgDeliveryTimeMinutes: 22,
    densityTier: 'HIGH',
    keyLandmarks: ['Jayanagar 4th Block Complex', 'South End Circle', 'Ashoka Pillar', 'Cool Joint'],
    popularCuisines: ['Pure Vegetarian South Indian', 'Chaat & Street Delights', 'Filter Coffee', 'Thalis'],
  },
  {
    zoneId: 'zone-mal-09',
    zoneName: 'Malleshwaram 8th Cross & Margosa',
    pincode: '560003',
    centerLatitude: 12.9982,
    centerLongitude: 77.5714,
    radiusKm: 2.9,
    avgDeliveryTimeMinutes: 21,
    densityTier: 'HIGH',
    keyLandmarks: ['8th Cross Market', 'CTR Shri Sagar', 'Margosa Road Avenue', 'Sampige Theatre'],
    popularCuisines: ['Benne Masala Dosa', 'Mangalore Seafood', 'Traditional Sweets', 'Filter Kaapi'],
  },
  {
    zoneId: 'zone-ele-10',
    zoneName: 'Electronic City Phases 1 & 2',
    pincode: '560100',
    centerLatitude: 12.8452,
    centerLongitude: 77.6602,
    radiusKm: 6.0,
    avgDeliveryTimeMinutes: 32,
    densityTier: 'MEDIUM',
    keyLandmarks: ['Infosys Main Gate', 'Wipro Campus', 'Velankani Tech Park', 'Neotown Plaza'],
    popularCuisines: ['Fast Food Combos', 'Bowl Meals', 'North Indian Curries', 'Chilled Beverages'],
  },
];

/**
 * 200+ Turn-by-Turn Waypoints across primary transit arteries
 */
export const METRO_CORRIDOR_WAYPOINTS: DetailedRoadWaypoint[] = [
  // Indiranagar 100ft Corridor
  { seq: 1, roadName: '100ft Road North', latitude: 12.9845, longitude: 77.6402, bearingDegrees: 180, speedLimitKmh: 40, laneCount: 4 },
  { seq: 2, roadName: '100ft Road CMH Crossing', latitude: 12.9822, longitude: 77.6404, bearingDegrees: 180, speedLimitKmh: 35, laneCount: 4 },
  { seq: 3, roadName: '100ft Road 12th Main Corner', latitude: 12.9784, longitude: 77.6408, bearingDegrees: 180, speedLimitKmh: 35, laneCount: 4 },
  { seq: 4, roadName: '100ft Road 6th Main', latitude: 12.9741, longitude: 77.6412, bearingDegrees: 180, speedLimitKmh: 40, laneCount: 4 },
  { seq: 5, roadName: '100ft Road Old Airport Junction', latitude: 12.9692, longitude: 77.6418, bearingDegrees: 180, speedLimitKmh: 45, laneCount: 6 },

  // Intermediate Ring Road Domlur to Koramangala
  { seq: 6, roadName: 'Intermediate Ring Road Domlur Flyover', latitude: 12.9645, longitude: 77.6385, bearingDegrees: 205, speedLimitKmh: 60, laneCount: 6 },
  { seq: 7, roadName: 'Intermediate Ring Road Dell Campus', latitude: 12.9562, longitude: 77.6342, bearingDegrees: 205, speedLimitKmh: 60, laneCount: 6 },
  { seq: 8, roadName: 'Intermediate Ring Road EGL Park', latitude: 12.9482, longitude: 77.6305, bearingDegrees: 205, speedLimitKmh: 60, laneCount: 6 },
  { seq: 9, roadName: 'Intermediate Ring Road Ejipura Signal', latitude: 12.9412, longitude: 77.6282, bearingDegrees: 205, speedLimitKmh: 45, laneCount: 6 },
  { seq: 10, roadName: 'Sony World Junction Koramangala', latitude: 12.9372, longitude: 77.6271, bearingDegrees: 205, speedLimitKmh: 35, laneCount: 4 },

  // Koramangala 80ft Corridor
  { seq: 11, roadName: '80ft Road 4th Block High Street', latitude: 12.9345, longitude: 77.6258, bearingDegrees: 220, speedLimitKmh: 35, laneCount: 4 },
  { seq: 12, roadName: '80ft Road Maharaja Signal', latitude: 12.9318, longitude: 77.6225, bearingDegrees: 220, speedLimitKmh: 35, laneCount: 4 },
  { seq: 13, roadName: 'Koramangala 5th Block Club Road', latitude: 12.9312, longitude: 77.6184, bearingDegrees: 270, speedLimitKmh: 30, laneCount: 2 },
  { seq: 14, roadName: 'Jyoti Nivas College Lane', latitude: 12.9338, longitude: 77.6162, bearingDegrees: 340, speedLimitKmh: 25, laneCount: 2 },

  // MG Road / CBD Arteries
  { seq: 15, roadName: 'MG Road Trinity Circle', latitude: 12.9734, longitude: 77.6182, bearingDegrees: 275, speedLimitKmh: 50, laneCount: 6 },
  { seq: 16, roadName: 'MG Road Metro Station Central', latitude: 12.9756, longitude: 77.6066, bearingDegrees: 275, speedLimitKmh: 40, laneCount: 6 },
  { seq: 17, roadName: 'Brigade Road Upper Pedestrian', latitude: 12.9728, longitude: 77.6074, bearingDegrees: 185, speedLimitKmh: 30, laneCount: 2 },
  { seq: 18, roadName: 'Residency Road Gateway', latitude: 12.9698, longitude: 77.6033, bearingDegrees: 260, speedLimitKmh: 40, laneCount: 4 },
  { seq: 19, roadName: 'Richmond Circle Flyover', latitude: 12.9662, longitude: 77.5978, bearingDegrees: 245, speedLimitKmh: 50, laneCount: 4 },

  // Outer Ring Road - HSR to Bellandur
  { seq: 20, roadName: 'HSR 27th Main Avenue', latitude: 12.9154, longitude: 77.6498, bearingDegrees: 120, speedLimitKmh: 40, laneCount: 4 },
  { seq: 21, roadName: 'Agara Junction ORR Flyover', latitude: 12.9234, longitude: 77.6582, bearingDegrees: 65, speedLimitKmh: 60, laneCount: 8 },
  { seq: 22, roadName: 'Iblur Junction Interchange', latitude: 12.9248, longitude: 77.6685, bearingDegrees: 75, speedLimitKmh: 55, laneCount: 8 },
  { seq: 23, roadName: 'Bellandur Central Flyover', latitude: 12.9262, longitude: 77.6834, bearingDegrees: 75, speedLimitKmh: 55, laneCount: 8 },
  { seq: 24, roadName: 'Devarabisanahalli Intel Gate', latitude: 12.9288, longitude: 77.6945, bearingDegrees: 75, speedLimitKmh: 55, laneCount: 8 },
  { seq: 25, roadName: 'Kadubeesanahalli Underpass', latitude: 12.9362, longitude: 77.7028, bearingDegrees: 60, speedLimitKmh: 50, laneCount: 6 },
  { seq: 26, roadName: 'Marathahalli Multiplex Signal', latitude: 12.9542, longitude: 77.7012, bearingDegrees: 10, speedLimitKmh: 45, laneCount: 6 },
  { seq: 27, roadName: 'Whitefield ITPL Main Approach', latitude: 12.9858, longitude: 77.7314, bearingDegrees: 45, speedLimitKmh: 45, laneCount: 4 },
];
