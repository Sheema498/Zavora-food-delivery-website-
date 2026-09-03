import ApiClient from '../api/client.js';
import { Order, User, AuditLog, Role } from '../types/index.js';

export const adminService = {
  async getDashboardStats() {
    const res = await ApiClient.get<any>('/admin/stats');
    return res.data;
  },

  async getAnalytics(range: 'today' | 'yesterday' | '7days' | '30days' | 'monthly' = '7days') {
    const res = await ApiClient.get<any>(`/admin/analytics?range=${range}`);
    return res.data;
  },

  async listOrders(page = 1, limit = 20, status?: string) {
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) query.set('status', status);
    const res = await ApiClient.get<Order[]>(`/admin/orders?${query.toString()}`);
    return {
      orders: res.data,
      meta: res.meta,
    };
  },

  async getLiveOrders(): Promise<Order[]> {
    const res = await ApiClient.get<Order[]>('/admin/live-orders');
    return res.data;
  },

  async listUsers(role?: Role, page = 1, limit = 20, search?: string) {
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (role) query.set('role', role);
    if (search) query.set('search', search);

    const res = await ApiClient.get<User[]>(`/admin/users?${query.toString()}`);
    return {
      users: res.data,
      meta: res.meta,
    };
  },

  async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    const res = await ApiClient.put<User>(`/admin/users/${userId}/status`, { isActive });
    return res.data;
  },

  async getAuditLogs(page = 1, limit = 20, action?: string, resource?: string) {
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (action) query.set('action', action);
    if (resource) query.set('resource', resource);

    const res = await ApiClient.get<AuditLog[]>(`/admin/audit-logs?${query.toString()}`);
    return {
      logs: res.data,
      meta: res.meta,
    };
  },

  async broadcastNotification(data: { title: string; message: string; targetRole?: Role }) {
    const res = await ApiClient.post<any>('/admin/broadcast', data);
    return res.data;
  },
};
