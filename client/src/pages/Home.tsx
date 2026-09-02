import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService.js';
import { Restaurant } from '../types/index.js';
import { RestaurantCard } from '../components/customer/RestaurantCard.js';
import { CUISINES_LIST } from '../constants/index.js';
import {
  UtensilsCrossed,
  Search,
  Sparkles,
  Zap,
  ShieldCheck,
  Bike,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';

export const Home: React.FC = () => {
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await restaurantService.listRestaurants({ limit: 6, sortBy: 'rating' });
        setFeaturedRestaurants(data.restaurants);
      } catch (err) {
        console.error('Failed to load featured restaurants:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/restaurants');
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 rounded-3xl overflow-hidden shadow-2xl mx-2 sm:mx-4 mt-2">
        {/* Background glow graphics */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-300 border border-white/10">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Real-Time Food Delivery & Live GPS Fleet Tracking</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Delicious Food Delivered <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-300 to-amber-200">
              Fast & Fresh to Your Doorstep.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connect directly with top artisanal restaurants, watch live kitchen preparation, and follow your delivery partner on the real-time interactive map.
          </p>

          {/* Big Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-slate-100"
          >
            <div className="flex-1 flex items-center pl-3 gap-2">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search for pizza, biryani, burgers, pasta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="shrink-0">
              Find Food
            </Button>
          </form>

          {/* Quick Stats Badges */}
          <div className="pt-6 flex flex-wrap justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-white">~25 Mins</span> Avg Delivery Time
            </div>
            <div className="flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-white">Live Sockets</span> GPS Broadcast
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">Zero Key</span> Keyless Navigation
            </div>
          </div>
        </div>
      </section>

      {/* Cuisines Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Explore Cuisines</h2>
            <p className="text-xs text-slate-500">Pick from top categories crafted fresh</p>
          </div>
          <Link
            to="/restaurants"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {CUISINES_LIST.slice(1).map((cuisine) => (
            <Link
              key={cuisine}
              to={`/restaurants?cuisine=${encodeURIComponent(cuisine)}`}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-card-hover hover:border-brand-300 transition-all text-center flex flex-col items-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform mb-2">
                {cuisine === 'Pizza'
                  ? '🍕'
                  : cuisine === 'Burgers'
                  ? '🍔'
                  : cuisine === 'Biryani'
                  ? '🍚'
                  : cuisine === 'Italian'
                  ? '🍝'
                  : cuisine === 'Desserts'
                  ? '🍰'
                  : '🍲'}
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                {cuisine}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Restaurants Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Featured Restaurants</h2>
            <p className="text-xs text-slate-500">Top customer favorites with real-time kitchen tracking</p>
          </div>
          <Link
            to="/restaurants"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All ({featuredRestaurants.length}+) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map((rest) => (
              <RestaurantCard key={rest.id} restaurant={rest} />
            ))}
          </div>
        )}
      </section>

      {/* Real-Time Order Lifecycle Explained */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-brand-400 font-bold text-xs uppercase tracking-wider">
              End-to-End Orchestration
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1">
              How QuickBite Real-Time Flow Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Every status update syncs automatically across all 4 dedicated dashboards without page refreshes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold mx-auto mb-3">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Customer Places Order</h4>
              <p className="text-xs text-slate-400 mt-1">
                Real-time Socket.IO immediately rings the restaurant kitchen chime.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mx-auto mb-3">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Kitchen Prepares Food</h4>
              <p className="text-xs text-slate-400 mt-1">
                Chef accepts with prep timer and marks order packed & ready for pickup.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mx-auto mb-3">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Driver Dispatched</h4>
              <p className="text-xs text-slate-400 mt-1">
                Admin or automated scheduler assigns nearest available online courier.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mx-auto mb-3">
                4
              </div>
              <h4 className="text-sm font-bold text-white">Live GPS Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">
                Customer watches courier move in real-time on keyless map & rates order.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
