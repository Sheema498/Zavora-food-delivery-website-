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
    description: 'Waiting for restaurant confirmation',
  },
  RESTAURANT_ACCEPTED: {
    label: 'Accepted by Kitchen',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    step: 2,
    description: 'Kitchen confirmed order',
  },
  PREPARING: {
    label: 'Cooking in Progress',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200',
    step: 3,
    description: 'Chef is cooking your meal fresh',
  },
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    step: 4,
    description: 'Food packed and waiting for delivery partner',
  },
  DELIVERY_ASSIGNED: {
    label: 'Driver Assigned',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50 border-cyan-200',
    step: 5,
    description: 'Delivery partner assigned and notified',
  },
  DELIVERY_ACCEPTED: {
    label: 'Driver Confirmed',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200',
    step: 6,
    description: 'Driver accepted assignment',
  },
  ARRIVED_AT_RESTAURANT: {
    label: 'Driver at Restaurant',
    color: 'text-teal-800',
    bgColor: 'bg-teal-100 border-teal-300',
    step: 7,
    description: 'Driver arrived at restaurant to collect food',
  },
  PICKED_UP: {
    label: 'Food Picked Up',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    step: 8,
    description: 'Package in delivery bag',
  },
  ON_THE_WAY: {
    label: 'Out for Delivery',
    color: 'text-brand-700',
    bgColor: 'bg-brand-50 border-brand-200',
    step: 9,
    description: 'Driver is on the way to your delivery address',
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    step: 10,
    description: 'Order successfully delivered',
  },
  RESTAURANT_REJECTED: {
    label: 'Restaurant Declined',
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
    name: 'Alex Johnson (Customer)',
    email: 'customer@example.com',
    badge: 'Customer',
    description: 'Browse, place orders, live GPS track & review',
  },
  {
    role: 'RESTAURANT',
    name: 'Marco Rossi (Pizza Hub)',
    email: 'owner@pizzahub.com',
    badge: 'Restaurant Owner',
    description: 'Receive order chimes, accept/reject, manage menu',
  },
  {
    role: 'DELIVERY_PARTNER',
    name: 'Arjun Kumar (Online Driver)',
    email: 'arjun.driver@quickbite.com',
    badge: 'Delivery Partner',
    description: 'Live dispatch alerts, GPS simulator, step actions',
  },
  {
    role: 'ADMIN',
    name: 'System Admin (Control Center)',
    email: 'admin@quickbite.com',
    badge: 'Super Admin',
    description: 'Live orders feed, manual driver dispatch, KPIs',
  },
];

export const CUISINES_LIST = [
  'All',
  'Italian',
  'Pizza',
  'Burgers',
  'Biryani',
  'North Indian',
  'South Indian',
  'Fast Food',
  'Pasta',
  'American',
  'Shakes',
  'Desserts',
];
