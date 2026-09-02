import { Request } from 'express';

export type Role = 'CUSTOMER' | 'RESTAURANT' | 'DELIVERY_PARTNER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'RESTAURANT_ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DELIVERY_ASSIGNED'
  | 'DELIVERY_ACCEPTED'
  | 'ARRIVED_AT_RESTAURANT'
  | 'PICKED_UP'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'RESTAURANT_REJECTED'
  | 'CANCELLED';

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'ONLINE_DEMO_PAY';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type VehicleType = 'BICYCLE' | 'MOTORBIKE' | 'SCOOTER' | 'CAR';

export type AssignmentStatus = 'ASSIGNED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'REASSIGNED';

export type DiscountType = 'PERCENTAGE' | 'FLAT';

export type NotificationType =
  | 'ORDER_STATUS'
  | 'DELIVERY_ASSIGNED'
  | 'DELIVERY_UPDATE'
  | 'PAYMENT'
  | 'SYSTEM'
  | 'PROMO';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
  restaurantId?: string;
  deliveryPartnerId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

// Order State Transition Matrix Validation
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['RESTAURANT_ACCEPTED', 'RESTAURANT_REJECTED', 'CANCELLED'],
  RESTAURANT_ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['DELIVERY_ASSIGNED', 'CANCELLED'],
  DELIVERY_ASSIGNED: ['DELIVERY_ACCEPTED', 'READY_FOR_PICKUP', 'CANCELLED'],
  DELIVERY_ACCEPTED: ['ARRIVED_AT_RESTAURANT', 'CANCELLED'],
  ARRIVED_AT_RESTAURANT: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['ON_THE_WAY', 'CANCELLED'],
  ON_THE_WAY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [], // Terminal state
  RESTAURANT_REJECTED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

export const ROLE_ALLOWED_STATUS_TRANSITIONS: Record<Role, OrderStatus[]> = {
  CUSTOMER: ['CANCELLED'],
  RESTAURANT: ['RESTAURANT_ACCEPTED', 'RESTAURANT_REJECTED', 'PREPARING', 'READY_FOR_PICKUP', 'CANCELLED'],
  DELIVERY_PARTNER: ['DELIVERY_ACCEPTED', 'ARRIVED_AT_RESTAURANT', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'],
  ADMIN: [
    'PENDING',
    'RESTAURANT_ACCEPTED',
    'RESTAURANT_REJECTED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'DELIVERY_ASSIGNED',
    'DELIVERY_ACCEPTED',
    'ARRIVED_AT_RESTAURANT',
    'PICKED_UP',
    'ON_THE_WAY',
    'DELIVERED',
    'CANCELLED',
  ],
};

export interface SocketEventsMap {
  'order:created': (data: { orderId: string; restaurantId: string; orderNumber: string; totalAmount: number }) => void;
  'order:accepted': (data: { orderId: string; estimatedPrepMinutes: number; restaurantName: string }) => void;
  'order:rejected': (data: { orderId: string; reason: string; restaurantName: string }) => void;
  'order:preparing': (data: { orderId: string; restaurantName: string }) => void;
  'order:ready': (data: { orderId: string; restaurantName: string; restaurantId: string }) => void;
  'delivery:assigned': (data: { orderId: string; deliveryPartnerId: string; orderNumber: string; restaurantName: string; customerAddress: string }) => void;
  'delivery:accepted': (data: { orderId: string; deliveryPartnerId: string; driverName: string; driverPhone: string }) => void;
  'delivery:arrived': (data: { orderId: string; driverName: string }) => void;
  'delivery:picked-up': (data: { orderId: string; driverName: string; estimatedMinutes: number }) => void;
  'delivery:started': (data: { orderId: string; driverName: string }) => void;
  'delivery:location-updated': (data: {
    orderId?: string;
    deliveryPartnerId: string;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    timestamp: string;
  }) => void;
  'order:delivered': (data: { orderId: string; deliveredAt: string }) => void;
  'notification:new': (data: { id: string; title: string; message: string; type: NotificationType; dataJson?: string; createdAt: string }) => void;
  'driver:status-changed': (data: { deliveryPartnerId: string; isOnline: boolean; isAvailable: boolean }) => void;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  foodItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  specialInstructions?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  restaurantId: string;
  deliveryPartnerId?: string | null;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount: number;
  tipAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddressSnapshot: string;
  customerNotes?: string | null;
  estimatedPrepMinutes?: number | null;
  placedAt: Date | string;
  acceptedAt?: Date | string | null;
  preparingAt?: Date | string | null;
  readyAt?: Date | string | null;
  pickedUpAt?: Date | string | null;
  deliveredAt?: Date | string | null;
  cancelledAt?: Date | string | null;
  restaurant: {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    latitude: number;
    longitude: number;
    cuisineTypes?: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  deliveryPartner?: {
    id: string;
    vehicleType: VehicleType;
    vehicleNumber?: string | null;
    user?: {
      name: string;
      phone?: string | null;
    };
  } | null;
  items: OrderItem[];
  statusHistory?: any[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
