/**
 * QuickBite Formal Order State Machine & Lifecycle Orchestrator
 * Strictly enforces legal lifecycle transitions, validates role-based permissions,
 * and coordinates atomic side-effects across payment, notifications, and inventory.
 */

import { OrderStatus, Role, VALID_ORDER_TRANSITIONS, ROLE_ALLOWED_STATUS_TRANSITIONS } from '../../types/index.js';
import { AppError } from '../../middleware/error.middleware.js';
import { HTTP_STATUS } from '../../constants/index.js';

export interface TransitionContext {
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  actorRole: Role;
  actorId: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface TransitionHook {
  onBeforeTransition?: (ctx: TransitionContext) => Promise<void> | void;
  onAfterTransition?: (ctx: TransitionContext) => Promise<void> | void;
  onFailure?: (ctx: TransitionContext, error: Error) => Promise<void> | void;
}

export class OrderStateMachine {
  private static hooks: Map<OrderStatus, TransitionHook[]> = new Map();

  /**
   * Register side-effect hooks for specific target statuses
   */
  public static registerHook(targetStatus: OrderStatus, hook: TransitionHook): void {
    const list = this.hooks.get(targetStatus) || [];
    list.push(hook);
    this.hooks.set(targetStatus, list);
  }

  /**
   * Validate whether a transition is mathematically valid in the state graph
   */
  public static isTransitionValid(from: OrderStatus, to: OrderStatus): boolean {
    const allowed = VALID_ORDER_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  /**
   * Validate whether a specific user role is authorized to perform the transition
   */
  public static isRoleAuthorized(role: Role, targetStatus: OrderStatus): boolean {
    const allowed = ROLE_ALLOWED_STATUS_TRANSITIONS[role];
    return allowed ? allowed.includes(targetStatus) : false;
  }

  /**
   * Verify and execute a state transition with lifecycle guards
   */
  public static async executeTransition(
    context: TransitionContext,
    performStateUpdate: () => Promise<unknown>
  ): Promise<unknown> {
    const { fromStatus, toStatus, actorRole } = context;

    // 1. Guard: Check valid transition in state graph
    if (!this.isTransitionValid(fromStatus, toStatus)) {
      throw new AppError(
        `Illegal order status transition from [${fromStatus}] to [${toStatus}]. This transition is not allowed by the order lifecycle machine.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 2. Guard: Check role permission
    if (!this.isRoleAuthorized(actorRole, toStatus)) {
      throw new AppError(
        `Role [${actorRole}] is not authorized to move order to status [${toStatus}].`,
        HTTP_STATUS.FORBIDDEN
      );
    }

    const hooks = this.hooks.get(toStatus) || [];

    // 3. Before Hooks
    for (const hook of hooks) {
      if (hook.onBeforeTransition) {
        await hook.onBeforeTransition(context);
      }
    }

    // 4. Perform atomic state update
    let result: unknown;
    try {
      result = await performStateUpdate();
    } catch (err: any) {
      for (const hook of hooks) {
        if (hook.onFailure) {
          await hook.onFailure(context, err);
        }
      }
      throw err;
    }

    // 5. After Hooks
    for (const hook of hooks) {
      if (hook.onAfterTransition) {
        try {
          await hook.onAfterTransition(context);
        } catch (hookErr) {
          console.error(`Post-transition hook failed for status ${toStatus}:`, hookErr);
        }
      }
    }

    return result;
  }
}
