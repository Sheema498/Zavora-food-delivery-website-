import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService.js';
import { FoodItem } from '../types/index.js';
import { FoodCard } from '../components/customer/FoodCard.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { UtensilsCrossed, Search, Filter, Sparkles, Flame, Check } from 'lucide-react';

const POPULAR_CATEGORIES = [
  { name: 'All', icon: '🍽️', desc: 'Browse all gourmet foods' },
  { name: 'Pizza', icon: '🍕', desc: 'Wood-fired & artisanal crusts' },
  { name: 'Burgers', icon: '🍔', desc: 'Smashed patties & craft sliders' },
  { name: 'Biryani', icon: '🍚', desc: 'Fragrant dum royal rice' },
  { name: 'South Indian', icon: '🥞', desc: 'Crispy dosas & fluffy idlis' },
  { name: 'North Indian', icon: '🍛', desc: 'Rich curries & tandoor breads' },
  { name: 'Chinese', icon: '🍜', desc: 'Dim sums, noodles & wok fries' },
  { name: 'Desserts', icon: '🍰', desc: 'Artisanal cakes & Italian gelato' },
  { name: 'Beverages', icon: '🥤', desc: 'Fresh shakes, coffees & coolers' },
  { name: 'Snacks', icon: '🍟', desc: 'Crispy starters & finger foods' },
  { name: 'Healthy Food', icon: '🥗', desc: 'Superfood bowls & fresh salads' },
];

export const Categories: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'All';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const [isVegetarian, setIsVegetarian] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const data = await restaurantService.searchFoodItems({
          search: searchTerm || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          isVegetarian: isVegetarian ? true : undefined,
          maxPrice: maxPrice < 1000 ? maxPrice : undefined,
        });
        setFoodItems(data);
      } catch (err) {
        console.error('Failed to load category dishes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [selectedCategory, searchTerm, isVegetarian, maxPrice]);

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    if (catName === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catName);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-orange-500 via-brand-500 to-amber-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover 50+ Gourmet Dishes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Explore Food Categories
          </h1>
          <p className="text-xs sm:text-sm text-orange-50 leading-relaxed">
            Pick from authentic wood-fired pizzas, dum biryanis, craft burgers, South Indian tiffins, and artisanal desserts cooked fresh by partner restaurants.
          </p>
        </div>
      </div>

      {/* Category Horizontal Selector Pills */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Select Category</h2>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {POPULAR_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategorySelect(cat.name)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-105'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-300 hover:bg-orange-50/50'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Dietary Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search dishes in ${selectedCategory}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Veg Toggle */}
          <button
            onClick={() => setIsVegetarian(!isVegetarian)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isVegetarian
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isVegetarian ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>Pure Veg Only</span>
          </button>

          {/* Price Range Slider */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Max Price:</span>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-24 accent-brand-500 cursor-pointer"
            />
            <span className="font-bold text-slate-800">₹{maxPrice}</span>
          </div>

          {(searchTerm || isVegetarian || selectedCategory !== 'All' || maxPrice < 1000) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchTerm('');
                setIsVegetarian(false);
                setMaxPrice(1000);
                searchParams.delete('category');
                setSearchParams(searchParams);
              }}
              className="text-xs text-brand-600 hover:text-brand-700 font-bold px-2 py-1 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Dish Results Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-2">
        <span>
          Showing {foodItems.length} dishes in <strong className="text-slate-800">{selectedCategory}</strong>
        </span>
        <Link to="/restaurants" className="text-brand-600 hover:underline">
          View by Restaurant &rarr;
        </Link>
      </div>

      {/* Food Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-slate-100 rounded-3xl h-72 animate-pulse" />
          ))}
        </div>
      ) : foodItems.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="w-8 h-8" />}
          title={`No dishes found for ${selectedCategory}`}
          description="Try selecting a different category or clearing search and dietary filters."
          actionText="Show All Food Items"
          onAction={() => {
            setSelectedCategory('All');
            setSearchTerm('');
            setIsVegetarian(false);
            setMaxPrice(1000);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {foodItems.map((item) => (
            <FoodCard key={item.id} foodItem={item} />
          ))}
        </div>
      )}
    </div>
  );
};
