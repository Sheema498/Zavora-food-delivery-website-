import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { userService } from '../services/userService.js';
import { orderService } from '../services/orderService.js';
import { Address } from '../types/index.js';
import { formatCurrency } from '../utils/formatters.js';
import { Button } from '../components/ui/Button.js';
import { AddressModal } from '../components/customer/AddressModal.js';
import {
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  UtensilsCrossed,
  ArrowLeft,
} from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, appliedCoupon, couponDiscount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'ONLINE_DEMO_PAY'>(
    'ONLINE_DEMO_PAY'
  );
  const [tipAmount, setTipAmount] = useState<number>(20);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await userService.getAddresses();
        setAddresses(data);
        const defaultAddr = data.find((a) => a.isDefault) || data[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.warn('Failed to load addresses:', err);
      }
    };

    fetchAddresses();
  }, []);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">Add dishes to checkout</p>
        <Link
          to="/restaurants"
          className="inline-block bg-brand-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm"
        >
          Explore Restaurants
        </Link>
      </div>
    );
  }

  const deliveryFee = cart.restaurant?.deliveryFee || 40.0;
  const taxAmount = (cart.subtotal * 0.05);
  const totalAmount = Math.max(0, cart.subtotal + deliveryFee + taxAmount - couponDiscount + tipAmount);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select or add a delivery address to proceed.');
      return;
    }

    try {
      setIsPlacingOrder(true);
      setError(null);

      const order = await orderService.createOrder({
        restaurantId: cart.restaurant!.id!,
        addressId: selectedAddressId,
        items: cart.items.map((i) => ({
          foodItemId: i.foodItemId,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions || undefined,
        })),
        paymentMethod,
        couponCode: appliedCoupon?.code,
        tipAmount,
        customerNotes: customerNotes.trim() || undefined,
      });

      // Navigate to confirmation
      navigate(`/order-confirmation/${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link & Title */}
      <div>
        <Link
          to="/restaurants"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dining
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Checkout & Payment</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ordering from <strong className="text-slate-800">{cart.restaurant?.name}</strong>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Delivery Address */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">1. Delivery Address</h3>
                  <p className="text-xs text-slate-500">Choose where to deliver your hot food</p>
                </div>
              </div>

              <Button
                onClick={() => setIsAddressModalOpen(true)}
                variant="outline"
                size="xs"
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Address
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                <p>No saved addresses found.</p>
                <Button
                  onClick={() => setIsAddressModalOpen(true)}
                  variant="primary"
                  size="sm"
                  className="mt-2"
                >
                  Add Your Address
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedAddressId === addr.id
                        ? 'bg-brand-50/60 border-brand-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-md">
                          {addr.label}
                        </span>
                        {selectedAddressId === addr.id && (
                          <CheckCircle2 className="w-4 h-4 text-brand-600" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-2">
                        {addr.recipientName || user?.name} ({addr.phone || user?.phone})
                      </p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                        {addr.streetAddress}, {addr.city}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Payment Method */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">2. Payment Method</h3>
                <p className="text-xs text-slate-500">
                  Safe payment sandbox without real external API secrets
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Online Demo Pay */}
              <label
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  paymentMethod === 'ONLINE_DEMO_PAY'
                    ? 'bg-emerald-50/60 border-emerald-500 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'ONLINE_DEMO_PAY'}
                  onChange={() => setPaymentMethod('ONLINE_DEMO_PAY')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Demo Online Pay (Instant Sandbox)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Safe simulated UPI/Card payment verified instantly without real charges.
                  </p>
                </div>
              </label>

              {/* Cash On Delivery */}
              <label
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'bg-brand-50/60 border-brand-500 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className="mt-1 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Banknote className="w-4 h-4 text-brand-600" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pay in cash or UPI QR upon food delivery arrival.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Driver Tip & Kitchen Instructions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">3. Driver Tip & Special Instructions</h3>

            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Tip your delivery courier partner (100% goes to driver):
              </p>
              <div className="flex flex-wrap gap-2">
                {[0, 10, 20, 30, 50].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipAmount(t)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tipAmount === t
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t === 0 ? 'No Tip' : `₹${t}`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kitchen / Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Leave package at door, ring doorbell, extra spicy..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 lg:sticky lg:top-20">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Order Summary
          </h3>

          <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="pt-2.5 first:pt-0 flex justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">
                    {item.quantity}x {item.foodItem.name}
                  </span>
                  {item.specialInstructions && (
                    <p className="text-[10px] text-slate-400 italic">
                      "{item.specialInstructions}"
                    </p>
                  )}
                </div>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Math */}
          <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
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
            {tipAmount > 0 && (
              <div className="flex justify-between text-brand-600 font-semibold">
                <span>Driver Tip</span>
                <span>{formatCurrency(tipAmount)}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon ({appliedCoupon?.code})</span>
                <span>- {formatCurrency(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
              <span>Grand Total</span>
              <span className="text-brand-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <Button
            onClick={handlePlaceOrder}
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isPlacingOrder}
          >
            Place Order • {formatCurrency(totalAmount)}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted & Safe Real-Time Order Dispatch</span>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onAddressSaved={(newAddr) => {
          setAddresses((prev) => [newAddr, ...prev]);
          setSelectedAddressId(newAddr.id);
        }}
      />
    </div>
  );
};
