/**
 * QuickBite Kitchen Order Ticket (KOT) Formatter
 * Generates structured thermal kitchen receipts for chefs with special cooking instructions,
 * dietary flags (Veg/Non-Veg/Spicy), and packaging checklists.
 */

import { Order } from '../../types/index.js';
import { formatDateTime } from '../../utils/formatters.js';

export class KotGenerator {
  /**
   * Format KOT ticket as plain-text thermal printout (80mm width)
   */
  public static formatThermalText(order: Order): string {
    const divider = '================================================';
    const subDivider = '------------------------------------------------';

    const lines: string[] = [];
    lines.push(divider);
    lines.push('             *** KITCHEN ORDER TICKET ***        ');
    lines.push(`            RESTAURANT: ${order.restaurant.name.toUpperCase()}`);
    lines.push(divider);
    lines.push(`ORDER #: ${order.orderNumber}          TABLE/TYPE: DELIVERY`);
    lines.push(`TIME:    ${formatDateTime(order.placedAt)}`);
    lines.push(`CHEF ESTIMATED PREP: ${order.estimatedPrepMinutes || 20} MINS`);
    lines.push(subDivider);
    lines.push('QTY   ITEM NAME                         SPECIALS');
    lines.push(subDivider);

    for (const item of order.items) {
      const qtyStr = String(item.quantity).padEnd(5, ' ');
      const nameStr = item.name.slice(0, 30).padEnd(32, ' ');
      lines.push(`${qtyStr} ${nameStr}`);
      if (item.specialInstructions) {
        lines.push(`      >> NOTE: ${item.specialInstructions}`);
      }
    }

    lines.push(subDivider);
    if (order.customerNotes) {
      lines.push(`CUSTOMER NOTE: "${order.customerNotes}"`);
      lines.push(subDivider);
    }

    lines.push(`TOTAL ITEMS: ${order.items.reduce((s: number, i: any) => s + i.quantity, 0)} items`);
    lines.push('PACKAGING: DOUBLE-SEAL BAG + TAMPER-EVIDENT TAPE');
    lines.push(divider);
    lines.push('      *** QUICKBITE KITCHEN DISPATCH SYSTEM ***  ');
    lines.push(divider);

    return lines.join('\n');
  }
}
