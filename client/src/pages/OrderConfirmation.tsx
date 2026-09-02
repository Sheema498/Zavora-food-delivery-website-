import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService.js';
import { Order } from '../types/index.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import { Button } from '../components/ui/Button.js';
import { CheckCircle2, Clock, Sparkles, ArrowRight } from 'lucide-react';

export const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const data = await orderService.getOrder(id);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order confirmation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (isLoading || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Confirming your delicious order...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed & Ringing Kitchen
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Thank You for Ordering!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Order <strong className="text-slate-900">#{order.orderNumber}</strong> has been sent to{' '}
            <strong className="text-slate-900">{order.restaurant.name}</strong>.
          </p>
        </div>

        {/* Live CTA Button */}
        <div className="pt-2">
          <Button
            onClick={() => navigate(`/orders/${order.id}/track`)}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto px-8 shadow-glow"
            icon={<Sparkles className="w-4 h-4" />}
          >
            Track Order Live on Map <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Order Summary Details */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Order Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Restaurant</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{order.restaurant.name}</p>
            <p className="text-slate-500">{order.restaurant.address}</p>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Estimated Delivery Time</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1">
              <Clock className="w-4 h-4 text-brand-500" /> ~{order.estimatedDeliveryMinutes} Minutes
            </p>
            <p className="text-slate-500">{formatDateTime(order.placedAt)}</p>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="divide-y divide-slate-100 pt-2 border-t border-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-2.5 flex justify-between text-xs">
              <span className="font-bold text-slate-800">
                {item.quantity}x {item.name}
              </span>
              <span className="font-semibold text-slate-900">{formatCurrency(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        {/* Pricing Total */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes</span>
            <span>{formatCurrency(order.taxAmount)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Discount</span>
              <span>- {formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
            <span>Total Paid ({order.paymentMethod.replace(/_/g, ' ')})</span>
            <span className="text-brand-600">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
