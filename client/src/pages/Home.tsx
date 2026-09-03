import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService.js';
import { FoodItem } from '../types/index.js';
import { FoodCard } from '../components/customer/FoodCard.js';
import {
  Search,
  Sparkles,
  Zap,
  ShieldCheck,
  Bike,
  Clock,
  ArrowRight,
  Flame,
  ChefHat,
  ShoppingBag,
  Star,
  CheckCircle2,
  Heart,
  Phone,
  MapPin,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { ZAVORA_BRAND } from '../constants/index.js';

const POPULAR_CUISINES = [
  { name: 'Pizza', icon: '🍕', desc: 'Artisanal Wood-Fired Crusts' },
  { name: 'Burgers', icon: '🍔', desc: 'Double Smashed Brioche' },
  { name: 'Biryani', icon: '🍚', desc: 'Royal Dum Charcoal Handi' },
  { name: 'South Indian', icon: '🥞', desc: 'Ghee Roast Crispy Tiffins' },
  { name: 'North Indian', icon: '🍛', desc: 'Slow-Simmered Rich Curries' },
  { name: 'Chinese', icon: '🍜', desc: 'Wok-Tossed Noodles & Dim Sum' },
  { name: 'Snacks', icon: '🍟', desc: 'Loaded Peri Peri Bites' },
  { name: 'Desserts', icon: '🍰', desc: 'Molten Lava & Gulab Jamun' },
  { name: 'Beverages', icon: '🥤', desc: 'Cold Brews & Shakes' },
];

export const Home: React.FC = () => {
  const [popularDishes, setPopularDishes] = useState<FoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeMenu = async () => {
      try {
        const dishData = await restaurantService.searchFoodItems({ limit: 8 });
        setPopularDishes(dishData);
      } catch (err) {
        console.error('Failed to load Zavora home page data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeMenu();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/menu');
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Banner with ZAVORA Identity */}
      <section className="relative bg-gradient-to-br from-[#3b1959] via-[#52227d] to-[#712ea8] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 rounded-3xl overflow-hidden shadow-2xl mx-3 sm:mx-6 mt-4">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Logo Tag */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white border border-white/20 shadow-sm">
            <img
              src="/zavora-logo.png"
              alt="Zavora"
              className="h-6 w-auto object-contain"
            />
            <span className="tracking-wide">Welcome to Zavora Restaurant</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight drop-shadow-sm">
            ZAVORA
            <span className="block text-2xl sm:text-4xl lg:text-5xl text-amber-300 mt-2 font-black">
              Satisfy your hunger instantly
            </span>
          </h1>

          <p className="text-sm sm:text-base text-purple-100 max-w-2xl mx-auto leading-relaxed font-medium">
            Hand-crafted artisanal pizzas, smashed gourmet burgers, royal dum biryanis, and rich curries cooked fresh to order by Master Chefs.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white p-2 sm:p-2.5 rounded-3xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-purple-100"
          >
            <div className="flex-1 flex items-center pl-4 gap-2.5">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search pizzas, biryanis, burgers, curries, desserts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="shrink-0 px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 font-bold"
            >
              Search Food
            </Button>
          </form>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              to="/menu"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
            >
              <span>Explore Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/categories"
              className="px-6 py-3 bg-white/15 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-colors"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Popular Food Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore by Taste</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Food Categories
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {POPULAR_CUISINES.map((cuisine) => (
            <Link
              key={cuisine.name}
              to={`/menu?category=${encodeURIComponent(cuisine.name)}`}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-center group cursor-pointer"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {cuisine.icon}
              </span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                {cuisine.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Popular Food Items (Best Sellers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Chef's Handcrafted Picks</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Popular Dishes at Zavora
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
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

      {/* 4. Why Choose Zavora */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4 mb-10">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              The Zavora Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              Why Customers Love Zavora
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We operate our own dedicated kitchen and single-courier delivery system to ensure maximum freshness, swift dispatch, and transparent live tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Master Chef Recipes</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every pizza dough is cold-fermented for 48 hours, biryani is charcoal-dum cooked, and burgers are smashed to crispy perfection.
              </p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-400/20 text-brand-400 flex items-center justify-center font-bold">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Dedicated Courier Dispatch</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct hand-off from kitchen pass to our dedicated delivery boy. No marketplace wait times or random driver cancellations.
              </p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Private Live GPS Tracking</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Follow your delivery boy live on our keyless map with real-time GPS coordinates and turn-by-turn ETA updates directly to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Simple 3-Step Ordering Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Quick & Seamless
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            How It Works
          </h2>
          <p className="text-xs text-slate-500">
            Order your favorite meal in three straightforward steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-brand-600 flex items-center justify-center font-black mx-auto text-base">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Choose Your Dishes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore our diverse menu across 9 categories and customize your order.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black mx-auto text-base">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Kitchen Prepares Fresh</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our kitchen head confirms your order instantly and cooks everything fresh.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black mx-auto text-base">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Fast Doorstep Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track your dedicated courier with real-time GPS until hot food arrives.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Verified Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            What Food Lovers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "The Artisanal Margherita Pizza is honestly the best sourdough crust in Bengaluru! The live GPS tracking was accurate to the minute."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                AJ
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Alex Johnson</p>
                <p className="text-[10px] text-slate-400">Verified Customer</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Ordered the Royal Dum Chicken Biryani for dinner. Piping hot, aromatic, and the delivery courier was courteous and swift!"
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                PS
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Priya Sharma</p>
                <p className="text-[10px] text-slate-400">Verified Customer</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "The Smashed Cheeseburger with Peri Peri fries hit the spot instantly. Zavora's quality is unmatched."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                RV
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Rahul Varma</p>
                <p className="text-[10px] text-slate-400">Verified Customer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom Order Now Call-To-Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 to-amber-500 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-black">
              Hungry Right Now?
            </h3>
            <p className="text-xs sm:text-sm text-orange-100 max-w-md">
              Satisfy your hunger instantly with fresh gourmet food delivered straight from Zavora's kitchen.
            </p>
          </div>
          <Link
            to="/menu"
            className="px-8 py-4 bg-white text-slate-900 hover:bg-orange-50 font-black text-sm rounded-2xl shadow-lg transition-transform hover:scale-105 shrink-0"
          >
            Order Now
          </Link>
        </div>
      </section>
    </div>
  );
};
