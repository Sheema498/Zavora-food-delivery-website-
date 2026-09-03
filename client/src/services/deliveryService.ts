import ApiClient from '../api/client.js';
import { Order, DeliveryPartnerProfile } from '../types/index.js';

export const deliveryService = {
  async getAvailableDrivers(lat?: number, lng?: number) {
    const query = new URLSearchParams();
    if (lat !== undefined) query.set('lat', lat.toString());
    if (lng !== undefined) query.set('lng', lng.toString());
    const res = await ApiClient.get<any[]>(`/delivery/available-partners?${query.toString()}`);
    return res.data;
  },

  async assignDriver(orderId: string, deliveryBoyId: string) {
    const res = await ApiClient.post<any>('/delivery/assign', {
      orderId,
      deliveryBoyId,
      deliveryPartnerId: deliveryBoyId,
    });
    return res.data;
  },

  async getActiveDelivery(): Promise<Order | null> {
    const res = await ApiClient.get<Order | null>('/delivery/active');
    return res.data;
  },

  async getEarnings() {
    const res = await ApiClient.get<any>('/delivery/earnings');
    return res.data;
  },

  async getHistory(page = 1, limit = 20) {
    const res = await ApiClient.get<Order[]>(`/delivery/history?page=${page}&limit=${limit}`);
    return {
      orders: res.data,
      meta: res.meta,
    };
  },

  async acceptAssignment(orderId: string): Promise<Order> {
    const res = await ApiClient.post<Order>(`/delivery/orders/${orderId}/accept`);
    return res.data;
  },

  async markArrived(orderId: string): Promise<Order> {
    const res = await ApiClient.post<Order>(`/delivery/orders/${orderId}/arrived`);
    return res.data;
  },

  async markPickedUp(orderId: string): Promise<Order> {
    const res = await ApiClient.post<Order>(`/delivery/orders/${orderId}/pickup`);
    return res.data;
  },

  async startDelivery(orderId: string): Promise<Order> {
    const res = await ApiClient.post<Order>(`/delivery/orders/${orderId}/start`);
    return res.data;
  },

  async completeDelivery(orderId: string): Promise<Order> {
    const res = await ApiClient.post<Order>(`/delivery/orders/${orderId}/complete`);
    return res.data;
  },

  async toggleOnline(isOnline: boolean): Promise<DeliveryPartnerProfile> {
    const res = await ApiClient.put<DeliveryPartnerProfile>('/delivery/online-status', { isOnline });
    return res.data;
  },

  async toggleOnlineStatus(isOnline: boolean): Promise<DeliveryPartnerProfile> {
    return this.toggleOnline(isOnline);
  },
};
