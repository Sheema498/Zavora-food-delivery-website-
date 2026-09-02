import React, { useState, useEffect } from 'react';
import { deliveryService } from '../services/deliveryService.js';
import { StatCard } from '../components/common/StatCard.js';
import { formatCurrency } from '../utils/formatters.js';
import { DollarSign, Award, CheckCircle2 } from 'lucide-react';

export const DeliveryEarnings: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await deliveryService.getEarnings();
        setData(res);
      } catch (err) {
        console.error('Failed to load earnings:', err);
      }
    };

    fetchEarnings();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Driver Shift Earnings</h1>
        <p className="text-xs text-slate-500">
          Track cumulative payouts, completion bonuses, and tip earnings
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Lifetime Payouts"
          value={formatCurrency(data?.totalEarnings || 0)}
          subtitle="Direct courier bank deposits"
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Total Completed Trips"
          value={data?.totalDeliveries || 0}
          subtitle="Orders delivered"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Courier Quality Score"
          value={`${(data?.rating || 4.9).toFixed(1)} ★`}
          subtitle="Eligible for surge bonuses"
          icon={<Award className="w-5 h-5" />}
          color="blue"
        />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Courier Pay Structure Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Base Pickup Pay</span>
            <p className="text-slate-500">₹25.00 fixed per restaurant pickup</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Distance Pay</span>
            <p className="text-slate-500">₹12.00 per kilometer traveled</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Customer Tips</span>
            <p className="text-slate-500">100% of customer tip passed to you</p>
          </div>
        </div>
      </div>
    </div>
  );
};
