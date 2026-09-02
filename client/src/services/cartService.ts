import ApiClient from '../api/client.js';
import { Cart } from '../types/index.js';

export const cartService = {
  async getCart(): Promise<Cart> {
    const res = await ApiClient.get<Cart>('/cart');
    return res.data;
  },

  async addItem(
    foodItemId: string,
    quantity = 1,
    specialInstructions?: string,
    clearExistingIfDifferent = false
  ): Promise<Cart> {
    const res = await ApiClient.post<Cart>('/cart/items', {
      foodItemId,
      quantity,
      specialInstructions,
      clearExistingIfDifferent,
    });
    return res.data;
  },

  async updateQuantity(cartItemId: string, quantity: number): Promise<Cart> {
    const res = await ApiClient.put<Cart>(`/cart/items/${cartItemId}`, { quantity });
    return res.data;
  },

  async removeItem(cartItemId: string): Promise<Cart> {
    const res = await ApiClient.delete<Cart>(`/cart/items/${cartItemId}`);
    return res.data;
  },

  async clearCart(): Promise<void> {
    await ApiClient.delete('/cart/clear');
  },
};
