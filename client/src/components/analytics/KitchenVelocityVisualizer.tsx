import React from 'react';
import { Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface KitchenVelocityProps {
  restaurantName: string;
  avgPrepMinutes: number;
  targetPrepMinutes: number;
  onTimePercent: number;
  activeOrdersCount: number;
}

export const KitchenVelocityVisualizer: React.FC<KitchenVelocityProps> = ({
  restaurantName,
  avgPrepMinutes,
  targetPrepMinutes,
  onTimePercent,
  activeOrdersCount,
}) => {
  const isHealthy = avgPrepMinutes <= targetPrepMinutes + 3;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{restaurantName} — Velocity Index</h3>
          <p className="text-xs text-slate-500">Live prep speed & kitchen load analytics</p>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
            isHealthy ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {isHealthy ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {isHealthy ? 'Peak Efficiency' : 'High Prep Load'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-slate-50 rounded-2xl">
          <span className="text-slate-400 block mb-1">Avg Cooking Time</span>
          <span className="text-lg font-black text-slate-900">{avgPrepMinutes} Mins</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Target: {targetPrepMinutes} Mins</span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl">
          <span className="text-slate-400 block mb-1">On-Time Prep Rate</span>
          <span className="text-lg font-black text-emerald-600">{onTimePercent}%</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">SLA Target: 90%+</span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl">
          <span className="text-slate-400 block mb-1">Active Cooking Woks</span>
          <span className="text-lg font-black text-brand-600">{activeOrdersCount} Orders</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Simultaneous Prep</span>
        </div>
      </div>
    </div>
  );
};
