import React, { useState, useEffect } from 'react';
import { deliveryService } from '../services/deliveryService.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import { CheckCircle2, Bike } from 'lucide-react';

export const DeliveryHistory: React.FC = () => {
  const [earningsData, setEarningsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await deliveryService.getEarnings();
        setEarningsData(data);
      } catch (err) {
        console.error('Failed to load delivery history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const deliveries = earningsData?.recentDeliveries || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Delivery Trip History</h1>
        <p className="text-xs text-slate-500">
          Review your completed orders, timestamps, and earned driver payouts
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : deliveries.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
          <Bike className="w-12 h-12 mx-auto stroke-[1.5] mb-2 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No completed trips yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Accept assignments and deliver orders to build your trip history.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map((d: any) => (
            <div
              key={d.id}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Order #{d.orderNumber}</h4>
                  <p className="text-xs text-slate-500">
                    Delivered at {formatDateTime(d.deliveredAt || d.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Base + Distance</span>
                  <span className="font-bold text-slate-800">{formatCurrency(d.deliveryFee + 45.0)}</span>
                </div>
                {d.tipAmount > 0 && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Customer Tip</span>
                    <span className="font-bold text-emerald-600">+{formatCurrency(d.tipAmount)}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Total Trip Pay</span>
                  <span className="font-black text-brand-600 text-sm">
                    {formatCurrency(d.deliveryFee + d.tipAmount + 45.0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
