import ApiClient from '../api/client.js';
import { Address } from '../types/index.js';

export const userService = {
  async getAddresses(): Promise<Address[]> {
    const res = await ApiClient.get<Address[]>('/users/addresses');
    return res.data;
  },

  async addAddress(data: Partial<Address>): Promise<Address> {
    const res = await ApiClient.post<Address>('/users/addresses', data);
    return res.data;
  },

  async updateAddress(id: string, data: Partial<Address>): Promise<Address> {
    const res = await ApiClient.put<Address>(`/users/addresses/${id}`, data);
    return res.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await ApiClient.delete(`/users/addresses/${id}`);
  },
};
