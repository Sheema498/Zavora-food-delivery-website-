import React from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../../types/index.js';
import { Star, Clock, MapPin, IndianRupee } from 'lucide-react';

export const RestaurantCard: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => {
  return (
    <Link
      to={`/restaurant/${restaurant.slug || restaurant.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-card-hover transition-all duration-200 flex flex-col"
    >
      {/* Banner / Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={
            restaurant.bannerUrl ||
            restaurant.logoUrl ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'
          }
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{restaurant.rating.toFixed(1)}</span>
          <span className="text-slate-400 font-normal">({restaurant.totalRatings})</span>
        </div>

        {/* Status / Prep Time Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          {restaurant.isOpen ? (
            <div className="bg-emerald-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
              OPEN NOW
            </div>
          ) : (
            <div className="bg-slate-900/90 text-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
              CLOSED
            </div>
          )}
        </div>

        {/* Prep time overlay */}
        <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-brand-400" />
          <span>{restaurant.avgPrepTimeMinutes} mins</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{restaurant.cuisineTypes}</p>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[130px]">{restaurant.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">₹{restaurant.deliveryFee} Deliv.</span>
            <span>•</span>
            <span className="font-bold text-slate-900">{restaurant.priceRange}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
