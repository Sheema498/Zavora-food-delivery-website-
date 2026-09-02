/**
 * QuickBite Multi-Channel Notification & Push Copy Templates
 * Formats customized real-time push, SMS, and in-app message copy
 * tailored for each stage of the 4-role order fulfillment lifecycle.
 */

import { OrderStatus } from '../../types/index.js';

export interface FormattedNotification {
  title: string;
  message: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  sound: string;
  actionUrl: string;
}

export class NotificationTemplateService {
  public static formatStatusNotification(
    status: OrderStatus,
    orderNumber: string,
    restaurantName: string,
    metadata?: { driverName?: string; prepMinutes?: number }
  ): FormattedNotification {
    switch (status) {
      case 'PENDING':
        return {
          title: `Order #${orderNumber} Placed Successfully!`,
          message: `Your food order from ${restaurantName} has been sent to the kitchen for confirmation.`,
          priority: 'NORMAL',
          sound: 'order_placed.mp3',
          actionUrl: `/orders`,
        };

      case 'RESTAURANT_ACCEPTED':
        return {
          title: `Kitchen Accepted Order #${orderNumber}! 👨‍🍳`,
          message: `${restaurantName} has accepted your order! Estimated cooking time: ~${metadata?.prepMinutes || 25} minutes.`,
          priority: 'HIGH',
          sound: 'kitchen_accepted.mp3',
          actionUrl: `/orders`,
        };

      case 'PREPARING':
        return {
          title: `Food is Cooking! 🔥`,
          message: `The chefs at ${restaurantName} are actively preparing your hot meal.`,
          priority: 'NORMAL',
          sound: 'cooking.mp3',
          actionUrl: `/orders`,
        };

      case 'READY_FOR_PICKUP':
        return {
          title: `Food is Packed & Ready for Pickup! 📦`,
          message: `Your order from ${restaurantName} is freshly boxed and waiting for driver collection.`,
          priority: 'HIGH',
          sound: 'food_ready.mp3',
          actionUrl: `/orders`,
        };

      case 'DELIVERY_ASSIGNED':
        return {
          title: `Courier Assigned! 🛵`,
          message: `${metadata?.driverName || 'A delivery partner'} has been assigned to pick up your order.`,
          priority: 'HIGH',
          sound: 'driver_assigned.mp3',
          actionUrl: `/orders`,
        };

      case 'DELIVERY_ACCEPTED':
        return {
          title: `Courier is Heading to Restaurant 📍`,
          message: `${metadata?.driverName || 'Your driver'} is en route to ${restaurantName} for pickup.`,
          priority: 'NORMAL',
          sound: 'driver_enroute.mp3',
          actionUrl: `/orders`,
        };

      case 'ARRIVED_AT_RESTAURANT':
        return {
          title: `Driver Arrived at ${restaurantName} 🏬`,
          message: `${metadata?.driverName || 'Your driver'} has reached the kitchen counter.`,
          priority: 'NORMAL',
          sound: 'chime.mp3',
          actionUrl: `/orders`,
        };

      case 'PICKED_UP':
        return {
          title: `Food Picked Up! 🛍️`,
          message: `${metadata?.driverName || 'Your driver'} has collected your food package from ${restaurantName}.`,
          priority: 'HIGH',
          sound: 'pickup.mp3',
          actionUrl: `/orders`,
        };

      case 'ON_THE_WAY':
        return {
          title: `Out for Delivery! 🚀`,
          message: `${metadata?.driverName || 'Your driver'} is on the way to your doorstep. Watch live GPS tracking!`,
          priority: 'URGENT',
          sound: 'on_the_way.mp3',
          actionUrl: `/orders`,
        };

      case 'DELIVERED':
        return {
          title: `Order Delivered! 🎉 Bon Appétit!`,
          message: `Your order #${orderNumber} from ${restaurantName} has been delivered. Please rate your experience!`,
          priority: 'URGENT',
          sound: 'delivered_fanfare.mp3',
          actionUrl: `/orders`,
        };

      case 'RESTAURANT_REJECTED':
        return {
          title: `Order Declined by Restaurant ⚠️`,
          message: `Unfortunately, ${restaurantName} could not accept your order at this time. Any online payment has been refunded.`,
          priority: 'URGENT',
          sound: 'alert.mp3',
          actionUrl: `/orders`,
        };

      case 'CANCELLED':
        return {
          title: `Order #${orderNumber} Cancelled`,
          message: `This order has been cancelled.`,
          priority: 'NORMAL',
          sound: 'alert.mp3',
          actionUrl: `/orders`,
        };

      default:
        return {
          title: `Order Update #${orderNumber}`,
          message: `Your order status is now ${status}.`,
          priority: 'NORMAL',
          sound: 'default.mp3',
          actionUrl: `/orders`,
        };
    }
  }
}
