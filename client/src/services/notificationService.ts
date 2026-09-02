import ApiClient from '../api/client.js';
import { Notification } from '../types/index.js';

export const notificationService = {
  async list(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const res = await ApiClient.get<Notification[]>('/notifications');
    return {
      notifications: res.data,
      unreadCount: res.meta?.unreadCount || 0,
    };
  },

  async markAsRead(id: string): Promise<void> {
    await ApiClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await ApiClient.put('/notifications/read-all');
  },
};
