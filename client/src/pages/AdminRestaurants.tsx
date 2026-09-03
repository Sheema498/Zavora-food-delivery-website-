import React, { useState, useEffect } from 'react';
import { restaurantService } from '../services/restaurantService.js';
import { Restaurant } from '../types/index.js';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminRestaurants: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        const data = await restaurantService.listRestaurants({ limit: 50 });
        setRestaurants(data.restaurants);
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Partner Restaurants Management</h1>
          <p className="text-xs text-slate-500">
            Platform dining partners, commission rates, and real-time open/closed statuses
          </p>
        </div>

        <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
          {restaurants.length} Active Partners
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading restaurants...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Restaurant</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Commission</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Menu Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {restaurants.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            r.logoUrl ||
                            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'
                          }
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{r.name}</p>
                          <p className="text-slate-400 text-[11px]">{r.cuisineTypes}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{r.address}, {r.city}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{r.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-purple-700">{((r.commissionRate ?? 0.15) * 100).toFixed(0)}%</td>
                    <td className="p-4">
                      {r.isOpen ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                          Open
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/restaurant/${r.slug || r.id}`}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700"
                      >
                        View Storefront →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
