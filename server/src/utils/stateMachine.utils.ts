import { VALID_ORDER_TRANSITIONS, ROLE_ALLOWED_STATUS_TRANSITIONS, OrderStatus, Role } from '../types/index.js';

export class OrderStateMachine {
  public static isTransitionValid(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
    const validNextStates = VALID_ORDER_TRANSITIONS[currentStatus];
    return validNextStates ? validNextStates.includes(nextStatus) : false;
  }

  public static isRoleAuthorized(role: Role, targetStatus: OrderStatus): boolean {
    const allowed = ROLE_ALLOWED_STATUS_TRANSITIONS[role];
    return allowed ? allowed.includes(targetStatus) : false;
  }
}
