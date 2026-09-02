import ApiClient from '../api/client.js';
import { RestaurantReview } from '../types/index.js';

export const reviewService = {
  async createReview(data: { orderId: string; rating: number; comment?: string }): Promise<RestaurantReview> {
    const res = await ApiClient.post<RestaurantReview>('/reviews', data);
    return res.data;
  },

  async replyToReview(reviewId: string, reply: string, restaurantId?: string): Promise<RestaurantReview> {
    const res = await ApiClient.post<RestaurantReview>(`/reviews/${reviewId}/reply`, {
      reply,
      restaurantId,
    });
    return res.data;
  },
};
