import { describe, it, expect } from 'vitest';
import { DispatchOptimizer, DispatchCandidateOrder, DispatchCandidateDriver } from '../domain/orchestration/dispatchOptimizer.js';

describe('Dispatch Optimizer Engine', () => {
  const mockOrder: DispatchCandidateOrder = {
    orderId: 'order-1',
    orderNumber: 'QB-1001',
    restaurantId: 'rest-1',
    restaurantLocation: { latitude: 12.9784, longitude: 77.6408 },
    customerLocation: { latitude: 12.9698, longitude: 77.6033 },
    readySinceMinutes: 5,
    isPriority: true,
  };

  const mockDrivers: DispatchCandidateDriver[] = [
    {
      deliveryPartnerId: 'driver-far',
      driverName: 'Far Driver',
      currentLocation: { latitude: 12.9154, longitude: 77.6498 }, // ~7 km away
      rating: 4.5,
      vehicleType: 'MOTORBIKE',
      activeDeliveriesCount: 0,
      completedTodayCount: 4,
    },
    {
      deliveryPartnerId: 'driver-near',
      driverName: 'Near Driver',
      currentLocation: { latitude: 12.9752, longitude: 77.6455 }, // ~0.6 km away
      rating: 4.9,
      vehicleType: 'MOTORBIKE',
      activeDeliveriesCount: 0,
      completedTodayCount: 8,
    },
    {
      deliveryPartnerId: 'driver-busy',
      driverName: 'Busy Driver',
      currentLocation: { latitude: 12.9780, longitude: 77.6410 },
      rating: 4.8,
      vehicleType: 'MOTORBIKE',
      activeDeliveriesCount: 3, // Overloaded
      completedTodayCount: 12,
    },
  ];

  it('should prefer nearest highly-rated available driver over distant or busy drivers', () => {
    const bestMatch = DispatchOptimizer.findBestDriverForOrder(mockOrder, mockDrivers);

    expect(bestMatch).toBeDefined();
    expect(bestMatch?.deliveryPartnerId).toBe('driver-near');
    expect(bestMatch?.pickupDistanceKm).toBeLessThan(1.5);
    expect(bestMatch?.matchScore).toBeGreaterThan(70);
  });

  it('should match multiple orders to multiple drivers without driver collision', () => {
    const order2: DispatchCandidateOrder = {
      orderId: 'order-2',
      orderNumber: 'QB-1002',
      restaurantId: 'rest-2',
      restaurantLocation: { latitude: 12.9345, longitude: 77.6258 },
      customerLocation: { latitude: 12.9312, longitude: 77.6184 },
      readySinceMinutes: 2,
      isPriority: false,
    };

    const matches = DispatchOptimizer.matchOrdersToDrivers([mockOrder, order2], mockDrivers);

    expect(matches.length).toBe(2);
    // Ensure distinct drivers assigned
    const driverIds = matches.map((m) => m.deliveryPartnerId);
    expect(new Set(driverIds).size).toBe(2);
  });
});
