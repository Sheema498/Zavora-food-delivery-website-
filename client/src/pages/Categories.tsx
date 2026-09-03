import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService.js';
import { FoodCategory } from '../types/index.js';
import { ArrowRight, Sparkles, Utensils } from 'lucide-react';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await restaurantService.listCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zavora Culinary Sections</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Food Categories
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          From wood-fired sourdough pizzas to rich slow-dum biryanis and authentic North & South Indian delights, explore our kitchen's specialty recipes.
        </p>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/menu?category=${encodeURIComponent(category.name)}`}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                    <Utensils className="w-6 h-6" />
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl">
                    {(category as any)._count?.foodItems || (category.foodItems?.length ?? 0)} Dishes
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    Authentic and handcrafted recipes from Zavora's specialty chefs.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-brand-600 group-hover:text-brand-700">
                <span>Browse {category.name}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
