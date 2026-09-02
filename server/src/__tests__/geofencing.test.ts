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
