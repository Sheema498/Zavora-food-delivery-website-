import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService.js';
import { FoodItem } from '../types/index.js';
import { FoodCard } from '../components/customer/FoodCard.js';
import { FOOD_CATEGORIES } from '../constants/index.js';
import { Search, Filter, Sparkles, Check, ArrowUpDown } from 'lucide-react';

export const Menu: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      try {
        const data = await restaurantService.searchFoodItems({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchTerm || undefined,
          isVegetarian: vegOnly ? true : undefined,
          limit: 100,
        });

        // Client-side sorting
        let sorted = [...data];
        if (sortBy === 'price-asc') {
          sorted.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        } else if (sortBy === 'price-desc') {
          sorted.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        } else if (sortBy === 'recommended') {
          sorted.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        }

        setFoodItems(sorted);
      } catch (err) {
        console.error('Error fetching Zavora menu:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [selectedCategory, searchTerm, vegOnly, sortBy]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hand-Cooked to Order</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Zavora Restaurant Menu
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Explore our complete selection of fresh pizzas, gourmet burgers, royal biryanis, slow-cooked curries, and handcrafted desserts.
        </p>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Pure Veg Toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                vegOnly
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  vegOnly ? 'border-emerald-600 bg-emerald-600' : 'border-emerald-600'
                }`}
              >
                {vegOnly && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span>Pure Veg Only</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="recommended">Best Sellers First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
          {FOOD_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-72 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : foodItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-brand-500 flex items-center justify-center mx-auto text-2xl">
            🍽️
          </div>
          <h3 className="text-base font-bold text-slate-800">No dishes match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try clearing your search query or selecting another food category to explore our kitchen's recipes.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchTerm('');
              setVegOnly(false);
            }}
            className="px-5 py-2.5 bg-brand-500 text-white rounded-2xl text-xs font-bold hover:bg-brand-600 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Showing {foodItems.length} dishes</span>
            <span>All prepared fresh by Zavora Master Chefs</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {foodItems.map((dish) => (
              <FoodCard key={dish.id} foodItem={dish} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
