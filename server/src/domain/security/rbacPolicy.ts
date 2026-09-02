/**
 * QuickBite Role-Based Access Control (RBAC) & Permissions Matrix
 * Defines fine-grained CRUD permissions, resource boundaries, and multi-tenant isolation.
 */

import { Role } from '../../types/index.js';

export type Permission =
  | 'ORDER:CREATE'
  | 'ORDER:READ_OWN'
  | 'ORDER:READ_RESTAURANT'
  | 'ORDER:READ_DELIVERY'
  | 'ORDER:READ_ALL'
  | 'ORDER:UPDATE_STATUS'
  | 'ORDER:CANCEL'
  | 'ORDER:ASSIGN_DRIVER'
  | 'MENU:CREATE'
  | 'MENU:UPDATE'
  | 'MENU:DELETE'
  | 'RESTAURANT:MANAGE_PROFILE'
  | 'DELIVERY:UPDATE_GPS'
  | 'DELIVERY:ACCEPT_TRIP'
  | 'ADMIN:MANAGE_USERS'
  | 'ADMIN:VIEW_AUDIT_LOGS'
  | 'ADMIN:BROADCAST'
  | 'ADMIN:FINANCIAL_REPORTS';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  CUSTOMER: [
    'ORDER:CREATE',
    'ORDER:READ_OWN',
    'ORDER:CANCEL',
  ],
  RESTAURANT: [
    'ORDER:READ_RESTAURANT',
    'ORDER:UPDATE_STATUS',
    'MENU:CREATE',
    'MENU:UPDATE',
    'MENU:DELETE',
    'RESTAURANT:MANAGE_PROFILE',
  ],
  DELIVERY_PARTNER: [
    'ORDER:READ_DELIVERY',
    'ORDER:UPDATE_STATUS',
    'DELIVERY:UPDATE_GPS',
    'DELIVERY:ACCEPT_TRIP',
  ],
  ADMIN: [
    'ORDER:CREATE',
    'ORDER:READ_OWN',
    'ORDER:READ_RESTAURANT',
    'ORDER:READ_DELIVERY',
    'ORDER:READ_ALL',
    'ORDER:UPDATE_STATUS',
    'ORDER:CANCEL',
    'ORDER:ASSIGN_DRIVER',
    'MENU:CREATE',
    'MENU:UPDATE',
    'MENU:DELETE',
    'RESTAURANT:MANAGE_PROFILE',
    'DELIVERY:UPDATE_GPS',
    'DELIVERY:ACCEPT_TRIP',
    'ADMIN:MANAGE_USERS',
    'ADMIN:VIEW_AUDIT_LOGS',
    'ADMIN:BROADCAST',
    'ADMIN:FINANCIAL_REPORTS',
  ],
};

export class RbacService {
  public static hasPermission(role: Role, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  public static requirePermission(role: Role, permission: Permission): boolean {
    if (!this.hasPermission(role, permission)) {
      return false;
    }
    return true;
  }
}
