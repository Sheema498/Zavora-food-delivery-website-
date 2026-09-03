/**
 * QuickBite Metro Geo-Graph & Road Network Engine
 * High-fidelity spatial nodes, road graph topologies, and speed matrices
 * for realistic keyless delivery simulation across urban zones.
 */

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface RoadNode {
  id: string;
  name: string;
  zone: string;
  location: GeoCoordinate;
  landmarkType: 'RESTAURANT_HUB' | 'RESIDENTIAL' | 'TECH_PARK' | 'INTERSECTION' | 'LANDMARK';
  description: string;
}

export interface RoadSegment {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  roadName: string;
  distanceMeters: number;
  speedLimitKmh: number;
  baseCongestionFactor: number; // 1.0 = clear, 2.5 = heavy traffic
  isOneWay: boolean;
  surfaceType: 'ASPHALT' | 'CONCRETE' | 'COBBLESTONE';
}

export interface TurnByTurnInstruction {
  stepNumber: number;
  roadName: string;
  action: 'START' | 'CONTINUE' | 'TURN_LEFT' | 'TURN_RIGHT' | 'SLIGHT_LEFT' | 'SLIGHT_RIGHT' | 'U_TURN' | 'ARRIVE';
  distanceMeters: number;
  estimatedDurationSeconds: number;
  startLocation: GeoCoordinate;
  endLocation: GeoCoordinate;
  instructionText: string;
}

/**
 * High-density road nodes for Bengaluru metropolitan food delivery corridors
 */
export const BENGALURU_METRO_NODES: RoadNode[] = [
  {
    id: 'node-ind-100ft-1',
    name: 'Indiranagar 100ft Road - 12th Main',
    zone: 'Indiranagar',
    location: { latitude: 12.9784, longitude: 77.6408 },
    landmarkType: 'RESTAURANT_HUB',
    description: 'Premier culinary corridor featuring top cafes, breweries, and pizzerias',
  },
  {
    id: 'node-ind-100ft-2',
    name: 'Indiranagar 100ft Road - CMH Junction',
    zone: 'Indiranagar',
    location: { latitude: 12.9822, longitude: 77.6404 },
    landmarkType: 'INTERSECTION',
    description: 'Major junction connecting CMH Road and Metro Station',
  },
  {
    id: 'node-ind-defence-colony',
    name: 'Defence Colony Residential Gate',
    zone: 'Indiranagar',
    location: { latitude: 12.9752, longitude: 77.6455 },
    landmarkType: 'RESIDENTIAL',
    description: 'High-density residential neighborhood and villas',
  },
  {
    id: 'node-kor-80ft-1',
    name: 'Koramangala 80ft Road - 4th Block',
    zone: 'Koramangala',
    location: { latitude: 12.9345, longitude: 77.6258 },
    landmarkType: 'RESTAURANT_HUB',
    description: 'Food street with artisanal burger joints, sushi bars, and dessert lounges',
  },
  {
    id: 'node-kor-sony-world',
    name: 'Sony World Junction Koramangala',
    zone: 'Koramangala',
    location: { latitude: 12.9372, longitude: 77.6271 },
    landmarkType: 'INTERSECTION',
    description: 'Central artery intersection connecting 80ft Road and Intermediate Ring Road',
  },
  {
    id: 'node-kor-5th-block',
    name: 'Koramangala 5th Block Residences',
    zone: 'Koramangala',
    location: { latitude: 12.9312, longitude: 77.6184 },
    landmarkType: 'RESIDENTIAL',
    description: 'Apartment towers and gated communities',
  },
  {
    id: 'node-mg-road-metro',
    name: 'MG Road Metro Station Central',
    zone: 'CBD',
    location: { latitude: 12.9756, longitude: 77.6066 },
    landmarkType: 'LANDMARK',
    description: 'Central business and commercial shopping district',
  },
  {
    id: 'node-brigade-road',
    name: 'Brigade Road Junction',
    zone: 'CBD',
    location: { latitude: 12.9728, longitude: 77.6074 },
    landmarkType: 'RESTAURANT_HUB',
    description: 'Iconic shopping and dining avenue',
  },
  {
    id: 'node-residency-road',
    name: 'Residency Road Prestige Towers',
    zone: 'CBD',
    location: { latitude: 12.9698, longitude: 77.6033 },
    landmarkType: 'RESIDENTIAL',
    description: 'Commercial corporate offices and luxury apartments',
  },
  {
    id: 'node-hsr-sector-1',
    name: 'HSR Layout Sector 1 - 27th Main',
    zone: 'HSR Layout',
    location: { latitude: 12.9154, longitude: 77.6498 },
    landmarkType: 'RESTAURANT_HUB',
    description: 'Startup hub with trending cloud kitchens and biryani specialists',
  },
  {
    id: 'node-hsr-cpwd',
    name: 'HSR CPWD Complex',
    zone: 'HSR Layout',
    location: { latitude: 12.9122, longitude: 77.6432 },
    landmarkType: 'RESIDENTIAL',
    description: 'Residential apartments and commercial outlets',
  },
  {
    id: 'node-bellandur-ecospace',
    name: 'Ecospace Business Park Gate 1',
    zone: 'Bellandur',
    location: { latitude: 12.9262, longitude: 77.6834 },
    landmarkType: 'TECH_PARK',
    description: 'Massive technology park employing 60,000+ professionals',
  },
  {
    id: 'node-bellandur-green-glen',
    name: 'Green Glen Layout Gate',
    zone: 'Bellandur',
    location: { latitude: 12.9304, longitude: 77.6748 },
    landmarkType: 'RESIDENTIAL',
    description: 'Gated high-rise residential apartment communities',
  },
  {
    id: 'node-whitefield-itpl',
    name: 'ITPL Main Gate Whitefield',
    zone: 'Whitefield',
    location: { latitude: 12.9858, longitude: 77.7314 },
    landmarkType: 'TECH_PARK',
    description: 'International Tech Park Bangalore tech cluster',
  },
  {
    id: 'node-whitefield-palm-meadows',
    name: 'Palm Meadows Club Road',
    zone: 'Whitefield',
    location: { latitude: 12.9642, longitude: 77.7428 },
    landmarkType: 'RESIDENTIAL',
    description: 'Luxury villa community and residential enclave',
  },
];

/**
 * Explicit topological connectivity and road graph segments
 */
export const BENGALURU_ROAD_SEGMENTS: RoadSegment[] = [
  {
    id: 'seg-1',
    fromNodeId: 'node-ind-100ft-1',
    toNodeId: 'node-ind-100ft-2',
    roadName: '100 Feet Road',
    distanceMeters: 450,
    speedLimitKmh: 40,
    baseCongestionFactor: 1.2,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-2',
    fromNodeId: 'node-ind-100ft-1',
    toNodeId: 'node-ind-defence-colony',
    roadName: '12th Main Defence Colony Road',
    distanceMeters: 620,
    speedLimitKmh: 30,
    baseCongestionFactor: 1.0,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-3',
    fromNodeId: 'node-ind-100ft-1',
    toNodeId: 'node-mg-road-metro',
    roadName: 'Old Airport Road to MG Road Connector',
    distanceMeters: 3800,
    speedLimitKmh: 50,
    baseCongestionFactor: 1.6,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-4',
    fromNodeId: 'node-mg-road-metro',
    toNodeId: 'node-brigade-road',
    roadName: 'Brigade Road Cross',
    distanceMeters: 350,
    speedLimitKmh: 30,
    baseCongestionFactor: 1.8,
    isOneWay: true,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-5',
    fromNodeId: 'node-brigade-road',
    toNodeId: 'node-residency-road',
    roadName: 'Residency Road Flyover Slip',
    distanceMeters: 550,
    speedLimitKmh: 40,
    baseCongestionFactor: 1.3,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-6',
    fromNodeId: 'node-mg-road-metro',
    toNodeId: 'node-residency-road',
    roadName: 'Museum Road Bypass',
    distanceMeters: 750,
    speedLimitKmh: 35,
    baseCongestionFactor: 1.1,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-7',
    fromNodeId: 'node-ind-100ft-1',
    toNodeId: 'node-kor-sony-world',
    roadName: 'Intermediate Ring Road (Domlur-Koramangala)',
    distanceMeters: 4600,
    speedLimitKmh: 60,
    baseCongestionFactor: 1.5,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-8',
    fromNodeId: 'node-kor-sony-world',
    toNodeId: 'node-kor-80ft-1',
    roadName: 'Koramangala 80 Feet Road Main',
    distanceMeters: 400,
    speedLimitKmh: 35,
    baseCongestionFactor: 1.3,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-9',
    fromNodeId: 'node-kor-80ft-1',
    toNodeId: 'node-kor-5th-block',
    roadName: 'Koramangala 5th Block Link Road',
    distanceMeters: 900,
    speedLimitKmh: 30,
    baseCongestionFactor: 1.1,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-10',
    fromNodeId: 'node-kor-sony-world',
    toNodeId: 'node-hsr-sector-1',
    roadName: 'Sarjapur-HSR Link Road',
    distanceMeters: 3200,
    speedLimitKmh: 45,
    baseCongestionFactor: 1.4,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-11',
    fromNodeId: 'node-hsr-sector-1',
    toNodeId: 'node-hsr-cpwd',
    roadName: 'HSR 19th Main Avenue',
    distanceMeters: 850,
    speedLimitKmh: 35,
    baseCongestionFactor: 1.1,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-12',
    fromNodeId: 'node-hsr-sector-1',
    toNodeId: 'node-bellandur-green-glen',
    roadName: 'Outer Ring Road (Agara to Bellandur)',
    distanceMeters: 3100,
    speedLimitKmh: 55,
    baseCongestionFactor: 1.7,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-13',
    fromNodeId: 'node-bellandur-green-glen',
    toNodeId: 'node-bellandur-ecospace',
    roadName: 'Ecospace Service Road Access',
    distanceMeters: 1100,
    speedLimitKmh: 30,
    baseCongestionFactor: 1.5,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-14',
    fromNodeId: 'node-bellandur-ecospace',
    toNodeId: 'node-whitefield-itpl',
    roadName: 'Marathahalli-Whitefield Outer Ring Road',
    distanceMeters: 8500,
    speedLimitKmh: 50,
    baseCongestionFactor: 1.9,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
  {
    id: 'seg-15',
    fromNodeId: 'node-whitefield-itpl',
    toNodeId: 'node-whitefield-palm-meadows',
    roadName: 'Varthur-Whitefield Main Road',
    distanceMeters: 2800,
    speedLimitKmh: 40,
    baseCongestionFactor: 1.2,
    isOneWay: false,
    surfaceType: 'ASPHALT',
  },
];
