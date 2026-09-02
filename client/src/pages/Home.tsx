import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService.js';
import { Restaurant, FoodItem } from '../types/index.js';
import { RestaurantCard } from '../components/customer/RestaurantCard.js';
import { FoodCard } from '../components/customer/FoodCard.js';
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
  Award,
  Flame,
  ChefHat,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';

const POPULAR_CUISINES = [
  { name: 'Pizza', icon: '🍕', category: 'Pizza', count: '12+ items' },
  { name: 'Burgers', icon: '🍔', category: 'Burgers', count: '10+ items' },
  { name: 'Biryani', icon: '🍚', category: 'Biryani', count: '8+ items' },
  { name: 'South Indian', icon: '🥞', category: 'South Indian', count: '14+ items' },
  { name: 'North Indian', icon: '🍛', category: 'North Indian', count: '15+ items' },
  { name: 'Chinese', icon: '🍜', category: 'Chinese', count: '11+ items' },
  { name: 'Desserts', icon: '🍰', category: 'Desserts', count: '9+ items' },
  { name: 'Beverages', icon: '🥤', category: 'Beverages', count: '16+ items' },
];

export const Home: React.FC = () => {
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [popularDishes, setPopularDishes] = useState<FoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restData, dishData] = await Promise.all([
          restaurantService.listRestaurants({ limit: 6, sortBy: 'rating' }),
          restaurantService.searchFoodItems({ limit: 8 }),
        ]);
        setFeaturedRestaurants(restData.restaurants);
        setPopularDishes(dishData);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/restaurants');
    }
  };

  return (
    <div className="space-y-14 pb-20">
      {/* Hero Banner with Warm Cohesive Identity */}
      <section className="relative bg-gradient-to-br from-orange-600 via-brand-600 to-amber-700 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 rounded-3xl overflow-hidden shadow-2xl mx-3 sm:mx-6 mt-4">
        {/* Soft atmospheric background glow elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white border border-white/25 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Real-Time Kitchen Queue & Live GPS Fleet Broadcaster</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-sm">
            Gourmet Food Delivered <br className="hidden sm:inline" />
            <span className="text-amber-200">
              Fresh, Fast & Live to Your Doorstep.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-orange-100 max-w-2xl mx-auto leading-relaxed font-medium">
            Order from top partner restaurants, watch chef prep times in real time, and follow your delivery partner on the keyless topological vector map.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white p-2 sm:p-2.5 rounded-3xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-orange-100"
          >
            <div className="flex-1 flex items-center pl-4 gap-2.5">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search pizzas, biryanis, smashed burgers, pasta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="shrink-0 px-6 py-3 rounded-2xl">
              Search Food
            </Button>
          </form>

          {/* Highlight Badges */}
          <div className="pt-4 flex flex-wrap justify-center gap-6 text-xs text-orange-100 font-semibold">
            <div className="flex items-center gap-1.5 bg-black/10 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>~25 Mins Average Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/10 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
              <Bike className="w-4 h-4 text-sky-200" />
              <span>Real-Time Driver GPS</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/10 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>100% Verified Quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Food Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-brand-500" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Explore by Category</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Click any category to browse appetizing dishes directly</p>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-orange-50 px-3.5 py-2 rounded-xl border border-orange-200 transition-colors"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {POPULAR_CUISINES.map((cat) => (
            <Link
              key={cat.name}
              to={`/categories?category=${encodeURIComponent(cat.category)}`}
              className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-400 transition-all text-center flex flex-col items-center group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-3xl flex items-center justify-center group-hover:scale-110 transition-transform mb-2 shadow-xs">
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Gourmet Dishes Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Popular Gourmet Dishes</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Customer top picks ready to add directly to your cart</p>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-orange-50 px-3.5 py-2 rounded-xl border border-orange-200 transition-colors"
          >
            View More Dishes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-72 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDishes.slice(0, 8).map((dish) => (
              <FoodCard key={dish.id} foodItem={dish} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Partner Restaurants Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Featured Partner Restaurants</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Top rated kitchens with real-time order acceptance & prep tracking</p>
          </div>
          <Link
            to="/restaurants"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-orange-50 px-3.5 py-2 rounded-xl border border-orange-200 transition-colors"
          >
            View All ({featuredRestaurants.length}+) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-72 animate-pulse border border-slate-200" />
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
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-slate-200 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              End-to-End Synchronized Fulfillment
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              How QuickBite Real-Time Flow Operates
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Every status update syncs automatically across all 4 dedicated dashboards without page refreshes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-brand-600 flex items-center justify-center font-black mx-auto">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Customer Places Order</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Socket.IO event immediately triggers the acoustic chime in the restaurant kitchen queue.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black mx-auto">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">Kitchen Prepares Food</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chef accepts with prep timer (10-60m) and marks the order packed & ready for courier collection.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black mx-auto">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Courier Dispatched</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Admin central control room assigns the nearest available online delivery partner.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black mx-auto">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900">Live GPS Delivery</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Customer tracks delivery partner in real-time on keyless vector map and submits review.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
