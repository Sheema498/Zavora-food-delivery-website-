/**
 * QuickBite Responsive HTML Transactional Email Receipt Template
 * Formats responsive HTML email order confirmations with itemized tables,
 * delivery addresses, map previews, and one-click order tracking buttons.
 */

import { Order } from '../../types/index.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export class EmailReceiptTemplateService {
  public static renderOrderConfirmationEmail(order: Order): string {
    const parsedAddress = JSON.parse(order.deliveryAddressSnapshot || '{}');

    const itemRows = order.items
      .map(
        (item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 14px;">
          <strong>${item.name}</strong> × ${item.quantity}
          ${item.specialInstructions ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">Note: ${item.specialInstructions}</div>` : ''}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-weight: 600; font-size: 14px;">
          ${formatCurrency(item.totalPrice)}
        </td>
      </tr>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation #${order.orderNumber}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #ea580c; padding: 32px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">QuickBite</h1>
                    <p style="color: #ffedd5; margin: 8px 0 0 0; font-size: 14px;">Your order has been placed with the kitchen!</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px;">
                      <div>
                        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Order Number</div>
                        <div style="font-size: 18px; font-weight: 900; color: #0f172a;">#${order.orderNumber}</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Placed At</div>
                        <div style="font-size: 14px; color: #334155;">${formatDateTime(order.createdAt)}</div>
                      </div>
                    </div>

                    <!-- Restaurant -->
                    <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
                      <div style="font-size: 12px; color: #c2410c; font-weight: 700;">RESTAURANT</div>
                      <div style="font-size: 15px; font-weight: 800; color: #431407;">${order.restaurant.name}</div>
                      <div style="font-size: 12px; color: #9a3412;">${order.restaurant.address}</div>
                    </div>

                    <!-- Items Table -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                      ${itemRows}
                    </table>

                    <!-- Price Summary -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 2px solid #f1f5f9; padding-top: 16px; font-size: 14px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Subtotal</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 600;">${formatCurrency(order.subtotal)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Delivery Logistics</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 600;">${formatCurrency(order.deliveryFee)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">GST Taxes (5%)</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 600;">${formatCurrency(order.taxAmount)}</td>
                      </tr>
                      ${order.discountAmount > 0 ? `
                      <tr>
                        <td style="padding: 4px 0; color: #16a34a; font-weight: 600;">Promo Discount</td>
                        <td style="padding: 4px 0; text-align: right; color: #16a34a; font-weight: 600;">- ${formatCurrency(order.discountAmount)}</td>
                      </tr>` : ''}
                      ${order.tipAmount > 0 ? `
                      <tr>
                        <td style="padding: 4px 0; color: #ea580c; font-weight: 600;">Courier Tip</td>
                        <td style="padding: 4px 0; text-align: right; color: #ea580c; font-weight: 600;">+ ${formatCurrency(order.tipAmount)}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 900; color: #0f172a; border-top: 1px solid #e2e8f0;">Total Paid</td>
                        <td style="padding: 12px 0 0 0; text-align: right; font-size: 18px; font-weight: 900; color: #ea580c; border-top: 1px solid #e2e8f0;">${formatCurrency(order.totalAmount)}</td>
                      </tr>
                    </table>

                    <!-- Delivery Address -->
                    <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
                      <div style="font-weight: 700; color: #475569; text-transform: uppercase; font-size: 11px; margin-bottom: 4px;">Delivering To:</div>
                      <div style="font-weight: 800; color: #0f172a;">${parsedAddress.recipientName || order.customer?.name}</div>
                      <div style="color: #64748b;">${parsedAddress.streetAddress || 'Bangalore, Karnataka'}</div>
                    </div>

                    <!-- Button -->
                    <div style="text-align: center; margin-top: 24px;">
                      <a href="/orders" style="background-color: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block;">
                        Track Live Kitchen & Driver GPS →
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
                    QuickBite Food Delivery Platform • Fast, fresh, live-tracked meals to your doorstep.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
