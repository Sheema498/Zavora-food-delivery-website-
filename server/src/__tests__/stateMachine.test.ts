import { describe, it, expect } from 'vitest';
import { OrderStateMachine } from '../utils/stateMachine.utils.js';

describe('Zavora Order State Machine & Lifecycle Transitions', () => {
  it('should allow valid linear order progression transitions', () => {
    expect(OrderStateMachine.isTransitionValid('PENDING', 'RESTAURANT_ACCEPTED')).toBe(true);
    expect(OrderStateMachine.isTransitionValid('PENDING', 'RESTAURANT_REJECTED')).toBe(true);
    expect(OrderStateMachine.isTransitionValid('PENDING', 'CANCELLED')).toBe(true);

    expect(OrderStateMachine.isTransitionValid('RESTAURANT_ACCEPTED', 'PREPARING')).toBe(true);
    expect(OrderStateMachine.isTransitionValid('PREPARING', 'READY_FOR_PICKUP')).toBe(true);
    expect(OrderStateMachine.isTransitionValid('READY_FOR_PICKUP', 'DELIVERY_ASSIGNED')).toBe(true);
    expect(OrderStateMachine.isTransitionValid('DELIVERY_ASSIGNED', 'DELIVERY_ACCEPTED')).toBe(true);
    expect(OrderStateMachine.isTransitionValid('DELIVERY_ACCEPTED', 'ARRIVED_AT_RESTAURANT')).toBe(true);
    expect(OrderStateMachine.isTransitionValid('ARRIVED_AT_RESTAURANT', 'PICKED_UP')).toBe(true);
    expect(OrderStateMachine.isTransitionValid('PICKED_UP', 'ON_THE_WAY')).toBe(true);
    expect(OrderStateMachine.isTransitionValid('ON_THE_WAY', 'DELIVERED')).toBe(true);
  });

  it('should strictly disallow illegal reverse or skip transitions', () => {
    // Cannot skip directly from PENDING to DELIVERED
    expect(OrderStateMachine.isTransitionValid('PENDING', 'DELIVERED')).toBe(false);

    // Cannot move backwards from DELIVERED to PREPARING
    expect(OrderStateMachine.isTransitionValid('DELIVERED', 'PREPARING')).toBe(false);

    // Cannot transition after CANCELLED
    expect(OrderStateMachine.isTransitionValid('CANCELLED', 'DELIVERED')).toBe(false);
  });

  it('should enforce role-based authorization matrix for Zavora 4 roles', () => {
    // Restaurant Manager can ACCEPT / REJECT / PREPARE / mark READY
    expect(OrderStateMachine.isRoleAuthorized('RESTAURANT_MANAGER', 'RESTAURANT_ACCEPTED')).toBe(true);
    expect(OrderStateMachine.isRoleAuthorized('RESTAURANT_MANAGER', 'PREPARING')).toBe(true);
    expect(OrderStateMachine.isRoleAuthorized('RESTAURANT_MANAGER', 'READY_FOR_PICKUP')).toBe(true);
    // Restaurant Manager cannot mark order as DELIVERED
    expect(OrderStateMachine.isRoleAuthorized('RESTAURANT_MANAGER', 'DELIVERED')).toBe(false);

    // Delivery Boy can ACCEPT assignment, ARRIVE, PICK UP, and DELIVER
    expect(OrderStateMachine.isRoleAuthorized('DELIVERY_BOY', 'DELIVERY_ACCEPTED')).toBe(true);
    expect(OrderStateMachine.isRoleAuthorized('DELIVERY_BOY', 'ARRIVED_AT_RESTAURANT')).toBe(true);
    expect(OrderStateMachine.isRoleAuthorized('DELIVERY_BOY', 'PICKED_UP')).toBe(true);
    expect(OrderStateMachine.isRoleAuthorized('DELIVERY_BOY', 'ON_THE_WAY')).toBe(true);
    expect(OrderStateMachine.isRoleAuthorized('DELIVERY_BOY', 'DELIVERED')).toBe(true);
    // Delivery Boy cannot accept incoming kitchen orders
    expect(OrderStateMachine.isRoleAuthorized('DELIVERY_BOY', 'RESTAURANT_ACCEPTED')).toBe(false);

    // Customer can only CANCEL
    expect(OrderStateMachine.isRoleAuthorized('CUSTOMER', 'CANCELLED')).toBe(true);
    expect(OrderStateMachine.isRoleAuthorized('CUSTOMER', 'DELIVERED')).toBe(false);

    // Super Admin has complete oversight permissions
    expect(OrderStateMachine.isRoleAuthorized('SUPER_ADMIN', 'DELIVERY_ASSIGNED')).toBe(true);
    expect(OrderStateMachine.isRoleAuthorized('SUPER_ADMIN', 'CANCELLED')).toBe(true);
  });
});
