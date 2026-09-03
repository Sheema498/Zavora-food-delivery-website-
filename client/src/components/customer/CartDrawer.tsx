import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';
import { X, Plus, Minus, Trash2, Tag, ShoppingBag, ArrowRight, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { Button } from '../ui/Button.js';
import { Modal } from '../ui/Modal.js';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    restaurantConflict,
    confirmClearAndAdd,
    cancelRestaurantConflict,
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState<string>('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponError(null);
    setIsApplyingCoupon(true);
    const result = await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);

    if (result.success) {
      setCouponInput('');
    } else {
      setCouponError(result.error || 'Failed to apply coupon');
    }
  };

  const deliveryFee = cart?.restaurant?.deliveryFee || 40.0;
  const taxAmount = cart ? (cart.subtotal * 0.05) : 0;
  const totalAmount = cart ? Math.max(0, cart.subtotal + deliveryFee + taxAmount - couponDiscount) : 0;

  const handleCheckout = () => {
    closeCartDrawer();
    navigate('/checkout');
  };

  return (
    <>
      {/* Slide-over Drawer */}
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={closeCartDrawer}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-100 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your Cart</h3>
                  {cart?.restaurant && (
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">
                      From {cart.restaurant.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={closeCartDrawer}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items Body */}
            {!cart || cart.items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Your cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6">
                  Explore top restaurants in your area and add mouth-watering dishes to your cart.
                </p>
                <Button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/restaurants');
                  }}
                  variant="primary"
                >
                  Explore Restaurants
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Items List */}
                <div className="divide-y divide-slate-100">
                  {cart.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.foodItem.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(item.unitPrice)} each
                        </p>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-slate-600 hover:text-brand-600 p-0.5 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-slate-600 hover:text-brand-600 p-0.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[60px]">
                        <span className="text-xs font-bold text-slate-900">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    <Tag className="w-3.5 h-3.5 text-brand-500" />
                    <span>Apply Promo Code</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-emerald-800 text-xs">
                      <div>
                        <span className="font-bold">{appliedCoupon.code}</span> applied!
                        <p className="text-[10px] text-emerald-600">
                          You saved {formatCurrency(couponDiscount)}
                        </p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Try: QUICK50 or WELCOME100"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs uppercase font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <Button
                        type="submit"
                        size="xs"
                        variant="dark"
                        isLoading={isApplyingCoupon}
                      >
                        Apply
                      </Button>
                    </form>
                  )}
                  {couponError && <p className="text-[11px] text-rose-500 mt-1.5">{couponError}</p>}
                </div>

                {/* Bill Breakdown */}
                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (5% GST)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>- {formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                    <span>To Pay</span>
                    <span className="text-brand-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Checkout CTA */}
            {cart && cart.items.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <Button
                  onClick={handleCheckout}
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-between"
                >
                  <span>Checkout</span>
                  <span className="flex items-center gap-1">
                    {formatCurrency(totalAmount)} <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Restaurant Conflict Confirmation Dialog */}
      <Modal
        isOpen={restaurantConflict.isOpen}
        onClose={cancelRestaurantConflict}
        title="Restaurant Conflict"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-medium">
              Your cart contains items from another restaurant. Would you like to clear your current cart and add this item?
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={cancelRestaurantConflict} variant="outline" size="sm">
              Keep Current Cart
            </Button>
            <Button onClick={confirmClearAndAdd} variant="primary" size="sm">
              Clear Cart & Add
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
