import ApiClient from '../api/client.js';
import { User } from '../types/index.js';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(data: Record<string, unknown>): Promise<AuthResponse> {
    const res = await ApiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await ApiClient.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await ApiClient.get<User>('/auth/me');
    return res.data;
  },

  async updateProfile(data: { name?: string; phone?: string; avatarUrl?: string }): Promise<User> {
    const res = await ApiClient.put<User>('/auth/profile', data);
    return res.data;
  },
};
