import { OrderStatus, Role } from '../types/index.js';

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; step: number; description: string }
> = {
  PENDING: {
    label: 'Order Placed',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    step: 1,
    description: 'Received by Zavora Restaurant, waiting for kitchen confirmation',
  },
  RESTAURANT_ACCEPTED: {
    label: 'Accepted by Kitchen',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    step: 2,
    description: 'Manager confirmed order, preparing workspace',
  },
  PREPARING: {
    label: 'Cooking in Progress',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200',
    step: 3,
    description: 'Chef is preparing your fresh meal',
  },
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    step: 4,
    description: 'Food is packed and ready for delivery boy assignment',
  },
  DELIVERY_ASSIGNED: {
    label: 'Courier Assigned',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50 border-cyan-200',
    step: 5,
    description: 'Assigned to Zavora dedicated delivery boy',
  },
  DELIVERY_ACCEPTED: {
    label: 'Courier Accepted',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200',
    step: 6,
    description: 'Delivery boy accepted the delivery assignment',
  },
  ARRIVED_AT_RESTAURANT: {
    label: 'Courier at Zavora',
    color: 'text-teal-800',
    bgColor: 'bg-teal-100 border-teal-300',
    step: 7,
    description: 'Delivery boy has arrived at Zavora Restaurant to collect food',
  },
  PICKED_UP: {
    label: 'Food Picked Up',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    step: 8,
    description: 'Package secured in thermal delivery bag',
  },
  ON_THE_WAY: {
    label: 'Out for Delivery',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    step: 9,
    description: 'Courier is en route to your doorstep (Live GPS active)',
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    step: 10,
    description: 'Order successfully delivered to customer',
  },
  RESTAURANT_REJECTED: {
    label: 'Declined by Restaurant',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    step: -1,
    description: 'Order could not be fulfilled',
  },
  CANCELLED: {
    label: 'Order Cancelled',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200',
    step: -1,
    description: 'Order was cancelled',
  },
};

export const DEMO_CREDENTIALS: Array<{
  role: Role;
  name: string;
  email: string;
  badge: string;
  description: string;
}> = [
  {
    role: 'CUSTOMER',
    name: 'Alex Johnson',
    email: 'customer@zavora.com',
    badge: 'Customer',
    description: 'Browse Zavora menu, order food, track live delivery GPS',
  },
  {
    role: 'RESTAURANT_MANAGER',
    name: 'Chef Rajesh Sharma',
    email: 'manager@zavora.com',
    badge: 'Restaurant Manager',
    description: 'Incoming order queue, kitchen prep stages, assign courier',
  },
  {
    role: 'DELIVERY_BOY',
    name: 'Kiran Kumar',
    email: 'delivery@zavora.com',
    badge: 'Delivery Boy',
    description: 'Accept deliveries, arrive, pick up, broadcast live GPS, deliver',
  },
  {
    role: 'SUPER_ADMIN',
    name: 'System Super Administrator',
    email: 'admin@zavora.com',
    badge: 'Super Admin',
    description: 'Full business analytics, food performance, category revenue',
    role: 'RESTAURANT_ADMIN',
    name: 'Zavora Pizza House (Kitchen)',
    email: 'owner1@zavora.com',
    badge: 'Restaurant Admin',
    description: 'Receive order chimes, accept/reject, manage menu',
  },
  {
    role: 'DELIVERY_PARTNER',
    name: 'Partner 1 (Dedicated Courier)',
    email: 'partner1@zavora.com',
    badge: 'Delivery Partner',
    description: 'Dedicated dispatch alerts, GPS simulator, step actions',
  },
  {
    role: 'SUPER_ADMIN',
    name: 'Super Admin (Operations)',
    email: 'admin@zavora.com',
    badge: 'Super Admin',
    description: 'Live orders matrix, central dispatch, platform KPIs',
  },
];

export const FOOD_CATEGORIES = [
  'All',
  'Pizza',
  'Burgers',
  'Biryani',
  'South Indian',
  'North Indian',
  'Chinese',
  'Snacks',
  'Desserts',
  'Beverages',
];

export const CUISINES_LIST = FOOD_CATEGORIES;

export const ZAVORA_BRAND = {
  name: 'Zavora',
  tagline: 'Satisfy your hunger instantly',
  restaurantName: 'Zavora Restaurant',
  logoUrl: '/zavora-logo.png',
  address: '88 Brigade Road, Ashok Nagar, Bengaluru',
  phone: '+91 80 4123 9901',
  email: 'restaurant@zavora.com',
  hours: '11:00 AM - 11:30 PM Daily',
};
