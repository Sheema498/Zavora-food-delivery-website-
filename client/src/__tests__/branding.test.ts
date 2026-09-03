import { describe, it, expect } from 'vitest';
import { ZAVORA_BRAND, ORDER_STATUS_CONFIG, DEMO_CREDENTIALS, FOOD_CATEGORIES } from '../constants/index.js';

describe('Zavora Branding & Configuration', () => {
  it('has exact Zavora branding details and tagline', () => {
    expect(ZAVORA_BRAND.name).toBe('Zavora');
    expect(ZAVORA_BRAND.tagline).toBe('Satisfy your hunger instantly');
    expect(ZAVORA_BRAND.restaurantName).toBe('Zavora Restaurant');
    expect(ZAVORA_BRAND.logoUrl).toBe('/zavora-logo.png');
  });

  it('configures demo credentials for the 4 canonical roles', () => {
    const roles = DEMO_CREDENTIALS.map((c) => c.role);
    expect(roles).toContain('CUSTOMER');
    expect(roles).toContain('RESTAURANT_MANAGER');
    expect(roles).toContain('DELIVERY_BOY');
    expect(roles).toContain('SUPER_ADMIN');

    const customerCred = DEMO_CREDENTIALS.find((c) => c.role === 'CUSTOMER');
    expect(customerCred?.email).toBe('customer@zavora.com');

    const managerCred = DEMO_CREDENTIALS.find((c) => c.role === 'RESTAURANT_MANAGER');
    expect(managerCred?.email).toBe('manager@zavora.com');

    const driverCred = DEMO_CREDENTIALS.find((c) => c.role === 'DELIVERY_BOY');
    expect(driverCred?.email).toBe('delivery@zavora.com');

    const adminCred = DEMO_CREDENTIALS.find((c) => c.role === 'SUPER_ADMIN');
    expect(adminCred?.email).toBe('admin@zavora.com');
  });

  it('contains comprehensive single-restaurant food categories', () => {
    expect(FOOD_CATEGORIES).toContain('Pizza');
    expect(FOOD_CATEGORIES).toContain('Burgers');
    expect(FOOD_CATEGORIES).toContain('Biryani');
    expect(FOOD_CATEGORIES).toContain('Desserts');
  });

  it('defines linear progression steps in ORDER_STATUS_CONFIG', () => {
    expect(ORDER_STATUS_CONFIG.PENDING.step).toBe(1);
    expect(ORDER_STATUS_CONFIG.RESTAURANT_ACCEPTED.step).toBe(2);
    expect(ORDER_STATUS_CONFIG.PREPARING.step).toBe(3);
    expect(ORDER_STATUS_CONFIG.READY_FOR_PICKUP.step).toBe(4);
    expect(ORDER_STATUS_CONFIG.DELIVERY_ASSIGNED.step).toBe(5);
    expect(ORDER_STATUS_CONFIG.DELIVERY_ACCEPTED.step).toBe(6);
    expect(ORDER_STATUS_CONFIG.ARRIVED_AT_RESTAURANT.step).toBe(7);
    expect(ORDER_STATUS_CONFIG.PICKED_UP.step).toBe(8);
    expect(ORDER_STATUS_CONFIG.ON_THE_WAY.step).toBe(9);
    expect(ORDER_STATUS_CONFIG.DELIVERED.step).toBe(10);
  });
});
