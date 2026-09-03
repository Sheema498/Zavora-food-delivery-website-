import { describe, it, expect } from 'vitest';

describe('Zavora GPS Privacy & Role Security Rules', () => {
  const isGpsTrackingAuthorized = (
    role: string,
    isOrderCustomer: boolean,
    isAssignedDeliveryBoy: boolean
  ): boolean => {
    // Only the customer who placed the order or the assigned delivery boy can receive/join live GPS tracking
    if (role === 'CUSTOMER' && isOrderCustomer) return true;
    if (role === 'DELIVERY_BOY' && isAssignedDeliveryBoy) return true;
    // Explicitly denied for Manager and Super Admin
    return false;
  };

  it('allows the customer who owns the order to access live GPS', () => {
    expect(isGpsTrackingAuthorized('CUSTOMER', true, false)).toBe(true);
  });

  it('strictly denies another customer from accessing live GPS', () => {
    expect(isGpsTrackingAuthorized('CUSTOMER', false, false)).toBe(false);
  });

  it('allows the assigned delivery boy to access live GPS telemetry', () => {
    expect(isGpsTrackingAuthorized('DELIVERY_BOY', false, true)).toBe(true);
  });

  it('strictly denies unassigned delivery boys from accessing live GPS', () => {
    expect(isGpsTrackingAuthorized('DELIVERY_BOY', false, false)).toBe(false);
  });

  it('strictly denies Restaurant Manager from viewing or subscribing to live GPS', () => {
    expect(isGpsTrackingAuthorized('RESTAURANT_MANAGER', true, true)).toBe(false);
    expect(isGpsTrackingAuthorized('RESTAURANT_MANAGER', false, false)).toBe(false);
  });

  it('strictly denies Super Admin from viewing or subscribing to live GPS', () => {
    expect(isGpsTrackingAuthorized('SUPER_ADMIN', true, true)).toBe(false);
    expect(isGpsTrackingAuthorized('SUPER_ADMIN', false, false)).toBe(false);
  });
});
