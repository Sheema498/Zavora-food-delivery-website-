import React from 'react';
import { FoodItem } from '../../types/index.js';
import { useCart } from '../../context/CartContext.js';
import { Plus, Minus, Flame, Clock, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const FoodCard: React.FC<{ foodItem: FoodItem }> = ({ foodItem }) => {
  const { cart, addToCart, updateQuantity } = useCart();

  const cartItem = cart?.items.find((item) => item.foodItemId === foodItem.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-card transition-all flex flex-col justify-between">
      <div className="flex gap-4">
        {/* Details */}
        <div className="flex-1 min-w-0">
          {/* Dietary Indicators */}
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`w-4 h-4 rounded-sm border flex items-center justify-center p-0.5 ${
                foodItem.isVegetarian ? 'border-emerald-600' : 'border-rose-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  foodItem.isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </span>

            {foodItem.isBestSeller && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Best Seller
              </span>
            )}

            {foodItem.isSpicy && (
              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Flame className="w-3 h-3" /> Spicy
              </span>
            )}
          </div>

          <h4 className="text-sm font-bold text-slate-900 leading-snug">{foodItem.name}</h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {foodItem.description}
          </p>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-sm font-black text-slate-900">
              {formatCurrency(foodItem.discountPrice || foodItem.price)}
            </span>
            {foodItem.discountPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(foodItem.price)}
              </span>
            )}
            {foodItem.calories && (
              <span className="text-[10px] text-slate-400 font-medium">
                • {foodItem.calories} kcal
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail Image + Add to Cart Control */}
        <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 flex flex-col items-center justify-end">
          <img
            src={
              foodItem.imageUrl ||
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'
            }
            alt={foodItem.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          <div className="absolute -bottom-1">
            {!foodItem.isAvailable ? (
              <span className="bg-slate-900 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-lg shadow-md uppercase">
                Sold Out
              </span>
            ) : quantity > 0 ? (
              <div className="bg-white border border-brand-500 text-brand-600 rounded-xl shadow-md flex items-center gap-2 px-2 py-1">
                <button
                  onClick={() => updateQuantity(cartItem!.id, quantity - 1)}
                  className="hover:bg-brand-50 rounded p-0.5 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                <button
                  onClick={() => updateQuantity(cartItem!.id, quantity + 1)}
                  className="hover:bg-brand-50 rounded p-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(foodItem)}
                className="bg-white hover:bg-brand-50 border border-brand-500 text-brand-600 hover:text-brand-700 font-bold text-xs px-4 py-1.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                ADD
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
