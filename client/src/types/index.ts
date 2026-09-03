export type Role =
  | 'CUSTOMER'
  | 'RESTAURANT_MANAGER'
  | 'DELIVERY_BOY'
  | 'SUPER_ADMIN'
  | 'RESTAURANT'
  | 'RESTAURANT_ADMIN'
  | 'DELIVERY_PARTNER'
  | 'ADMIN';

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
export type NotificationType =
  | 'ORDER_STATUS'
  | 'DELIVERY_ASSIGNED'
  | 'DELIVERY_UPDATE'
  | 'PAYMENT'
  | 'SYSTEM'
  | 'PROMO';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  isActive: boolean;
  restaurantId?: string;
  deliveryBoyId?: string;
  deliveryPartnerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  recipientName?: string;
  phone?: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface FoodCategory {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  foodItems?: FoodItem[];
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  imageUrl?: string | null;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  isBestSeller?: boolean;
  prepTimeMinutes: number;
  calories?: number | null;
  displayOrder: number;
}

export interface RestaurantReview {
  id: string;
  restaurantId: string;
  customerId: string;
  orderId: string;
  rating: number;
  comment?: string | null;
  replyFromRestaurant?: string | null;
  isVerified: boolean;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isOpen: boolean;
  isFeatured?: boolean;
  cuisineTypes: string;
  priceRange: string;
  rating: number;
  totalRatings: number;
  avgPrepTimeMinutes: number;
  deliveryFee: number;
  minOrderAmount: number;
  commissionRate?: number;
  totalRevenue: number;
  categories?: FoodCategory[];
  reviews?: RestaurantReview[];
  _count?: {
    foodItems: number;
    reviews: number;
    orders?: number;
  };
}

export interface CartItem {
  id: string;
  cartId: string;
  foodItemId: string;
  quantity: number;
  unitPrice: number;
  specialInstructions?: string | null;
  foodItem: FoodItem;
}

export interface Cart {
  cartId: string;
  restaurant: Partial<Restaurant> | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  foodItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string | null;
  foodItem?: FoodItem;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string | null;
  changedById?: string | null;
  changedByRole?: string | null;
  createdAt: string;
}

export interface DeliveryBoyProfile {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  licenseNumber: string;
  isOnline: boolean;
  isAvailable: boolean;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  lastLocationUpdate?: string;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  user?: {
    id: string;
    name: string;
    phone: string;
    avatarUrl?: string | null;
  };
}

export type DeliveryPartnerProfile = DeliveryBoyProfile;

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  restaurantId: string;
  deliveryBoyId?: string | null;
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
  restaurantNotes?: string | null;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
  estimatedPrepMinutes?: number | null;
  estimatedDeliveryMinutes?: number | null;
  placedAt: string;
  acceptedAt?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  restaurant: Restaurant;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
  };
  deliveryBoy?: DeliveryBoyProfile | null;
  deliveryPartner?: DeliveryBoyProfile | null;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  review?: RestaurantReview | null;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  dataJson?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  validUntil: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadataJson?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  } | null;
}
