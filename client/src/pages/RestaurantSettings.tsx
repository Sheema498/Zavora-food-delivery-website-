import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { restaurantService } from '../services/restaurantService.js';
import { Restaurant } from '../types/index.js';
import { Input } from '../components/ui/Input.js';

export const RestaurantSettings: React.FC = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.restaurantId) return;
      try {
        setIsLoading(true);
        const data = await restaurantService.getRestaurant(user.restaurantId);
        setRestaurant(data);
      } catch (err) {
        console.error('Failed to load restaurant settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user?.restaurantId]);

  if (isLoading || !restaurant) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Kitchen & Restaurant Settings</h1>
        <p className="text-xs text-slate-500">
          Configure store details, delivery parameters, and default prep timers
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Store Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Restaurant Name" value={restaurant.name} disabled />
          <Input label="Cuisine Types" value={restaurant.cuisineTypes} disabled />
          <Input label="Contact Phone" value={restaurant.phone} disabled />
          <Input label="Contact Email" value={restaurant.email} disabled />
          <div className="sm:col-span-2">
            <Input label="Physical Store Address" value={`${restaurant.address}, ${restaurant.city}`} disabled />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Operations Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Avg Preparation Time</span>
              <span className="text-base font-black text-slate-900">
                {restaurant.avgPrepTimeMinutes} mins
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Delivery Fee</span>
              <span className="text-base font-black text-slate-900">
                ₹{restaurant.deliveryFee}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Platform Commission</span>
              <span className="text-base font-black text-slate-900">
                {(restaurant.commissionRate * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
