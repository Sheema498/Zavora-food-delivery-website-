import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService.js';
import { Restaurant } from '../types/index.js';
import { RestaurantCard } from '../components/customer/RestaurantCard.js';
import { FilterBar } from '../components/customer/FilterBar.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { UtensilsCrossed } from 'lucide-react';

export const Restaurants: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state initialized from query params
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [selectedCuisine, setSelectedCuisine] = useState<string>(searchParams.get('cuisine') || 'All');
  const [isVegetarian, setIsVegetarian] = useState<boolean>(searchParams.get('veg') === 'true');
  const [minRating, setMinRating] = useState<number | undefined>(
    searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined
  );
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'rating');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        const data = await restaurantService.listRestaurants({
          search: search || undefined,
          cuisine: selectedCuisine !== 'All' ? selectedCuisine : undefined,
          isVegetarian,
          rating: minRating,
          sortBy,
        });
        setRestaurants(data.restaurants);
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [search, selectedCuisine, isVegetarian, minRating, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Filter Controls */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Explore Restaurants & Kitchens
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Order delicious gourmet food with instant live kitchen prep updates
          </p>
        </div>

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          selectedCuisine={selectedCuisine}
          onCuisineChange={setSelectedCuisine}
          isVegetarian={isVegetarian}
          onVegetarianToggle={setIsVegetarian}
          minRating={minRating}
          onRatingChange={setMinRating}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-b border-slate-100 pb-3">
        <span>Showing {restaurants.length} restaurants</span>
        {selectedCuisine !== 'All' && <span>Filtered by: {selectedCuisine}</span>}
      </div>

      {/* Grid or Empty */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-slate-100 rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="w-8 h-8" />}
          title="No restaurants match your filters"
          description="Try broadening your search term or clearing cuisine and dietary filter toggles."
          actionText="Clear All Filters"
          onAction={() => {
            setSearch('');
            setSelectedCuisine('All');
            setIsVegetarian(false);
            setMinRating(undefined);
            setSortBy('rating');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((rest) => (
            <RestaurantCard key={rest.id} restaurant={rest} />
          ))}
        </div>
      )}
    </div>
  );
};
