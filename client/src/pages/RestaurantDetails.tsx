import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService.js';
import { Restaurant } from '../types/index.js';
import { FoodCard } from '../components/customer/FoodCard.js';
import { RatingStars } from '../components/common/RatingStars.js';
import {
  Star,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters.js';

export const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await restaurantService.getRestaurant(id);
        setRestaurant(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load restaurant details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="w-full h-64 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="w-64 h-8 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Restaurant Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">{error || 'Unable to locate this restaurant.'}</p>
        <Link
          to="/restaurants"
          className="inline-block bg-brand-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm"
        >
          Back to Restaurants
        </Link>
      </div>
    );
  }

  const allCategories = restaurant.categories || [];
  const activeCategories =
    selectedCategorySlug === 'all'
      ? allCategories
      : allCategories.filter((c) => c.slug === selectedCategorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Restaurant Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
        <div className="h-56 sm:h-72 w-full relative">
          <img
            src={
              restaurant.bannerUrl ||
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'
            }
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-brand-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                {restaurant.priceRange}
              </span>
              <span className="bg-slate-800 text-slate-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                {restaurant.cuisineTypes}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{restaurant.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              {restaurant.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                {restaurant.address}, {restaurant.city}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                ~{restaurant.avgPrepTimeMinutes} mins avg prep
              </span>
            </div>
          </div>

          {/* Rating Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl text-center shrink-0">
            <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-xl">
              <Star className="w-5 h-5 fill-amber-400" />
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {restaurant.totalRatings} verified reviews
            </p>
          </div>
        </div>
      </div>

      {/* Menu Categories Bar */}
      <div className="sticky top-16 z-30 bg-slate-50/95 backdrop-blur-md py-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedCategorySlug('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedCategorySlug === 'all'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Items
        </button>

        {allCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategorySlug(category.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategorySlug === category.slug
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {category.name} ({category.foodItems?.length || 0})
          </button>
        ))}
      </div>

      {/* Menu Items by Category */}
      <div className="space-y-10">
        {activeCategories.map((category) => (
          <section key={category.id} className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h2 className="text-lg font-black text-slate-900">{category.name}</h2>
              <p className="text-xs text-slate-500">
                Freshly made dishes from {restaurant.name}'s kitchen
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.foodItems && category.foodItems.length > 0 ? (
                category.foodItems.map((item) => <FoodCard key={item.id} foodItem={item} />)
              ) : (
                <p className="text-xs text-slate-400 py-4">No items listed in this category yet.</p>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Reviews & Ratings Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Verified Customer Reviews</h3>
              <p className="text-xs text-slate-500">
                Ratings submitted by customers after successful delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 font-bold text-slate-900">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{restaurant.rating.toFixed(1)} / 5.0</span>
          </div>
        </div>

        {restaurant.reviews && restaurant.reviews.length > 0 ? (
          <div className="space-y-4 divide-y divide-slate-100">
            {restaurant.reviews.map((review) => (
              <div key={review.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        review.customer?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          review.customer?.name || 'Customer'
                        )}&background=f97316&color=fff`
                      }
                      alt="Customer"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-slate-900">
                      {review.customer?.name || 'Customer'}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified Order
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {formatTimeAgo(review.createdAt)}
                  </span>
                </div>

                <RatingStars rating={review.rating} size="sm" />

                {review.comment && (
                  <p className="text-xs text-slate-700 leading-relaxed">{review.comment}</p>
                )}

                {review.replyFromRestaurant && (
                  <div className="bg-slate-50 border-l-2 border-brand-500 p-3 rounded-r-xl text-xs mt-2">
                    <p className="font-bold text-slate-800">Response from {restaurant.name}:</p>
                    <p className="text-slate-600 mt-0.5">{review.replyFromRestaurant}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            No reviews yet for this restaurant. Place an order to be the first!
          </p>
        )}
      </section>
    </div>
  );
};
