import React from 'react';
import { OrderStatus, OrderStatusHistory } from '../../types/index.js';
import { ORDER_STATUS_CONFIG } from '../../constants/index.js';
import { Check, Clock, AlertCircle, XCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters.js';

export interface OrderTimelineProps {
  currentStatus: OrderStatus;
  statusHistory?: OrderStatusHistory[];
}

const LIFECYCLE_STEPS: Array<{ key: OrderStatus; label: string }> = [
  { key: 'PENDING', label: 'Placed' },
  { key: 'RESTAURANT_ACCEPTED', label: 'Accepted' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY_FOR_PICKUP', label: 'Ready' },
  { key: 'DELIVERY_ASSIGNED', label: 'Driver Assigned' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'ON_THE_WAY', label: 'On The Way' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, statusHistory = [] }) => {
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'RESTAURANT_REJECTED';
  const currentStepNum = ORDER_STATUS_CONFIG[currentStatus]?.step || 1;

  const historyMap = new Map<string, OrderStatusHistory>();
  statusHistory.forEach((h) => {
    historyMap.set(h.status, h);
  });

  return (
    <div className="w-full bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-brand-500" />
        Order Lifecycle Progress
      </h4>

      {isCancelled ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800">
          <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
          <div>
            <h5 className="text-sm font-bold">
              {currentStatus === 'RESTAURANT_REJECTED' ? 'Order Rejected by Restaurant' : 'Order Cancelled'}
            </h5>
            <p className="text-xs text-rose-600 mt-0.5">
              This order has been terminated. Any prepaid amounts have been refunded.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Horizontal Progress bar for Desktop */}
          <div className="hidden lg:flex items-center justify-between relative">
            {/* Background line */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-slate-100 -z-0" />

            {LIFECYCLE_STEPS.map((step, idx) => {
              const stepConfig = ORDER_STATUS_CONFIG[step.key];
              const isCompleted = currentStepNum >= stepConfig.step;
              const isCurrent = currentStepNum === stepConfig.step;
              const historyEntry = historyMap.get(step.key);

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10 w-24 text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-brand-500 text-white ring-4 ring-brand-100 shadow-glow scale-110'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                  </div>
                  <span className={`text-[11px] font-bold mt-2 leading-tight ${isCurrent ? 'text-brand-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                  {historyEntry && (
                    <span className="text-[9px] text-slate-400 mt-0.5 font-medium">
                      {new Date(historyEntry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Vertical Stepper for Mobile / Tablet */}
          <div className="lg:hidden space-y-4">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const stepConfig = ORDER_STATUS_CONFIG[step.key];
              const isCompleted = currentStepNum >= stepConfig.step;
              const isCurrent = currentStepNum === stepConfig.step;
              const historyEntry = historyMap.get(step.key);

              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isCurrent
                        ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold ${isCurrent ? 'text-brand-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      {historyEntry && (
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(historyEntry.createdAt)}
                        </span>
                      )}
                    </div>
                    {isCurrent && (
                      <p className="text-[11px] text-brand-600/80 mt-0.5">{stepConfig.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
