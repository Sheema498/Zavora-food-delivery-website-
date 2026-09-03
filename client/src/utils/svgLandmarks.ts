/**
 * Zavora SVG Vector Landmark & Urban Cartography Renderers
 * Generates rich procedural SVG vector features for the interactive keyless map:
 * metro lines, botanical parks, tech campus contours, water bodies, and traffic nodes.
 */

export interface SvgCartoFeature {
  id: string;
  type: 'METRO_LINE' | 'PARK' | 'WATER_BODY' | 'BUILDING_BLOCK' | 'FLYOVER';
  pathData: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  label?: string;
  labelCoordinate?: { x: number; y: number };
}

export const PROCEDURAL_CARTO_FEATURES: SvgCartoFeature[] = [
  // Metro Purple Line
  {
    id: 'metro-purple-line',
    type: 'METRO_LINE',
    pathData: 'M 40,480 Q 250,380 480,240 T 920,120',
    strokeColor: '#9333ea',
    strokeWidth: 4,
    label: 'Metro Purple Line (Baiyappanahalli - MG Road - Kengeri)',
    labelCoordinate: { x: 500, y: 230 },
  },
  // Metro Green Line
  {
    id: 'metro-green-line',
    type: 'METRO_LINE',
    pathData: 'M 480,40 Q 480,300 480,560',
    strokeColor: '#16a34a',
    strokeWidth: 4,
    label: 'Metro Green Line (Nagasandra - Majestic - Silk Board)',
    labelCoordinate: { x: 490, y: 320 },
  },
  // Cubbon Park / Green Sanctuary
  {
    id: 'park-cubbon',
    type: 'PARK',
    pathData: 'M 180,180 C 220,160 280,170 310,210 C 330,250 290,300 240,290 C 190,280 160,220 180,180 Z',
    fillColor: '#dcfce7',
    strokeColor: '#86efac',
    strokeWidth: 1.5,
    label: 'Central Botanical Park',
    labelCoordinate: { x: 230, y: 240 },
  },
  // Ulsoor Lake / Water Reservoir
  {
    id: 'water-ulsoor',
    type: 'WATER_BODY',
    pathData: 'M 620,160 C 670,140 730,170 740,220 C 750,260 700,290 660,280 C 610,270 590,200 620,160 Z',
    fillColor: '#e0f2fe',
    strokeColor: '#7dd3fc',
    strokeWidth: 1.5,
    label: 'Ulsoor Water Reservoir',
    labelCoordinate: { x: 650, y: 220 },
  },
  // Domlur Flyover Interchange
  {
    id: 'flyover-domlur',
    type: 'FLYOVER',
    pathData: 'M 350,340 Q 420,380 500,420',
    strokeColor: '#cbd5e1',
    strokeWidth: 6,
    label: 'Intermediate Ring Road Flyover',
    labelCoordinate: { x: 420, y: 395 },
  },
];
