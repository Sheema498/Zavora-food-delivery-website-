import { describe, it, expect } from 'vitest';
import { RoutingEngine } from '../domain/geo/routingEngine.js';
import { calculateHaversineDistanceKm } from '../utils/geo.utils.js';

describe('Spatial Routing & Navigation Engine', () => {
  it('should calculate accurate Haversine distance between two coordinates', () => {
    // Indiranagar to MG Road (~4.2 km)
    const indiranagar = { latitude: 12.9784, longitude: 77.6408 };
    const mgRoad = { latitude: 12.9756, longitude: 77.6066 };

    const distanceKm = calculateHaversineDistanceKm(
      indiranagar.latitude,
      indiranagar.longitude,
      mgRoad.latitude,
      mgRoad.longitude
    );

    expect(distanceKm).toBeGreaterThan(3.5);
    expect(distanceKm).toBeLessThan(4.5);
  });

  it('should compute topological route with waypoints and turn-by-turn guidance', () => {
    const origin = { latitude: 12.9784, longitude: 77.6408 }; // Indiranagar
    const destination = { latitude: 12.9698, longitude: 77.6033 }; // Residency Road

    const route = RoutingEngine.calculateRoute(origin, destination);

    expect(route).toBeDefined();
    expect(route.totalDistanceMeters).toBeGreaterThan(1000);
    expect(route.totalDistanceKm).toBeGreaterThan(1.0);
    expect(route.estimatedDurationMinutes).toBeGreaterThan(2);
    expect(route.waypoints.length).toBeGreaterThan(5);
    expect(route.instructions.length).toBeGreaterThan(2);

    // Verify first instruction is START and last is ARRIVE
    expect(route.instructions[0].action).toBe('START');
    expect(route.instructions[route.instructions.length - 1].action).toBe('ARRIVE');
  });

  it('should adapt travel time when traffic multiplier increases', () => {
    const origin = { latitude: 12.9784, longitude: 77.6408 };
    const destination = { latitude: 12.9345, longitude: 77.6258 }; // Koramangala

    const normalRoute = RoutingEngine.calculateRoute(origin, destination, 1.0);
    const rushHourRoute = RoutingEngine.calculateRoute(origin, destination, 2.0);

    expect(rushHourRoute.estimatedDurationSeconds).toBeGreaterThan(normalRoute.estimatedDurationSeconds);
  });
});
