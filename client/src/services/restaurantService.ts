import ApiClient from '../api/client.js';
import { Restaurant, FoodCategory, FoodItem } from '../types/index.js';

export interface ListRestaurantsParams {
  search?: string;
  cuisine?: string;
  priceRange?: string;
  rating?: number;
  isOpen?: boolean;
  isVegetarian?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export const restaurantService = {
  async listRestaurants(params: ListRestaurantsParams = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.cuisine && params.cuisine !== 'All') query.set('cuisine', params.cuisine);
    if (params.priceRange) query.set('priceRange', params.priceRange);
    if (params.rating) query.set('rating', params.rating.toString());
    if (params.isOpen !== undefined) query.set('isOpen', params.isOpen.toString());
    if (params.isVegetarian) query.set('isVegetarian', 'true');
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.sortBy) query.set('sortBy', params.sortBy);

    const res = await ApiClient.get<Restaurant[]>(`/restaurants?${query.toString()}`);
    return {
      restaurants: res.data,
      meta: res.meta,
    };
  },

  async getRestaurant(idOrSlug: string): Promise<Restaurant> {
    const res = await ApiClient.get<Restaurant>(`/restaurants/${idOrSlug}`);
    return res.data;
  },

  async getRestaurantMenu(id: string): Promise<FoodCategory[]> {
    const res = await ApiClient.get<FoodCategory[]>(`/restaurants/${id}/menu`);
    return res.data;
  },

  async listCategories(): Promise<any[]> {
    const res = await ApiClient.get<any[]>('/restaurants/discovery/categories');
    return res.data;
  },

  async searchFoodItems(params: { search?: string; category?: string; cuisine?: string; isVegetarian?: boolean; maxPrice?: number; limit?: number } = {}): Promise<FoodItem[]> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.cuisine) query.set('cuisine', params.cuisine);
    if (params.isVegetarian) query.set('isVegetarian', 'true');
    if (params.maxPrice) query.set('maxPrice', params.maxPrice.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const res = await ApiClient.get<FoodItem[]>(`/restaurants/discovery/food-items?${query.toString()}`);
    return res.data;
  },

  // Portal Management
  async getPortalStats() {
    const res = await ApiClient.get<any>('/restaurants/portal/stats');
    return res.data;
  },

  async addFoodItem(data: Record<string, unknown>): Promise<FoodItem> {
    const res = await ApiClient.post<FoodItem>('/restaurants/portal/food-items', data);
    return res.data;
  },

  async updateFoodItem(itemId: string, data: Record<string, unknown>): Promise<FoodItem> {
    const res = await ApiClient.put<FoodItem>(`/restaurants/portal/food-items/${itemId}`, data);
    return res.data;
  },

  async deleteFoodItem(itemId: string): Promise<{ success: boolean; message: string }> {
    const res = await ApiClient.delete<{ success: boolean; message: string }>(`/restaurants/portal/food-items/${itemId}`);
    return res.data;
  },

  async addCategory(data: { name: string; displayOrder?: number }): Promise<FoodCategory> {
    const res = await ApiClient.post<FoodCategory>('/restaurants/portal/categories', data);
    return res.data;
  },

  async toggleStatus(isOpen: boolean): Promise<Restaurant> {
    const res = await ApiClient.put<Restaurant>('/restaurants/portal/status', { isOpen });
    return res.data;
  },
};
