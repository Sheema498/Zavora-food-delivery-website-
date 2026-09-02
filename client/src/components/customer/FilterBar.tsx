import React from 'react';
import { CUISINES_LIST } from '../../constants/index.js';
import { Search, SlidersHorizontal, Star, Leaf, ArrowUpDown } from 'lucide-react';

export interface FilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedCuisine: string;
  onCuisineChange: (cuisine: string) => void;
  isVegetarian: boolean;
  onVegetarianToggle: (isVeg: boolean) => void;
  minRating: number | undefined;
  onRatingChange: (rating: number | undefined) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedCuisine,
  onCuisineChange,
  isVegetarian,
  onVegetarianToggle,
  minRating,
  onRatingChange,
  sortBy,
  onSortByChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search for restaurants, dishes, cuisines..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {/* Pure Veg Toggle */}
          <button
            onClick={() => onVegetarianToggle(!isVegetarian)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
              isVegetarian
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Pure Veg</span>
          </button>

          {/* Rating 4.0+ Toggle */}
          <button
            onClick={() => onRatingChange(minRating === 4 ? undefined : 4)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
              minRating === 4
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Rating 4.0+</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="rating">Sort: Highest Rated</option>
              <option value="prepTime">Sort: Fastest Delivery</option>
              <option value="deliveryFee">Sort: Lowest Delivery Fee</option>
              <option value="popular">Sort: Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cuisine Tags Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CUISINES_LIST.map((c) => (
          <button
            key={c}
            onClick={() => onCuisineChange(c)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedCuisine === c
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};
