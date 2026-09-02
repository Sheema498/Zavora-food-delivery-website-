import ApiClient from '../api/client.js';
import { Order, OrderStatus } from '../types/index.js';

export const orderService = {
  async createOrder(data: {
    restaurantId: string;
    addressId: string;
    items: Array<{ foodItemId: string; quantity: number; specialInstructions?: string }>;
    paymentMethod: 'CASH_ON_DELIVERY' | 'ONLINE_DEMO_PAY';
    couponCode?: string;
    tipAmount?: number;
    customerNotes?: string;
  }): Promise<Order> {
    const res = await ApiClient.post<Order>('/orders', data);
    return res.data;
  },

  async getOrder(id: string): Promise<Order> {
    const res = await ApiClient.get<Order>(`/orders/${id}`);
    return res.data;
  },

  async getCustomerOrders(page = 1, limit = 20) {
    const res = await ApiClient.get<Order[]>(`/orders/customer/my-orders?page=${page}&limit=${limit}`);
    return {
      orders: res.data,
      meta: res.meta,
    };
  },

  async getRestaurantOrders(status?: string, page = 1, limit = 25) {
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) query.set('status', status);
    const res = await ApiClient.get<Order[]>(`/orders/restaurant/orders?${query.toString()}`);
    return {
      orders: res.data,
      meta: res.meta,
    };
  },

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    options?: {
      rejectionReason?: string;
      cancellationReason?: string;
      estimatedPrepMinutes?: number;
      restaurantNotes?: string;
    }
  ): Promise<Order> {
    const res = await ApiClient.put<Order>(`/orders/${orderId}/status`, {
      status,
      ...options,
    });
    return res.data;
  },

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const res = await ApiClient.post<Order>(`/orders/${orderId}/cancel`, { reason });
    return res.data;
  },
};
