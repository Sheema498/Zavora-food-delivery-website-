import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Input } from '../components/ui/Input.js';
import { Bike } from 'lucide-react';

export const DeliveryProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Courier Vehicle Profile</h1>
        <p className="text-xs text-slate-500">
          Your registered delivery transport, identification, and fleet profile
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Active Delivery Partner
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={user?.name || ''} disabled />
          <Input label="Registered Phone" value={user?.phone || '+91 91234 56789'} disabled />
          <Input label="Vehicle Type" value="MOTORBIKE" disabled />
          <Input label="Vehicle Registration Number" value="KA-01-EQ-4421" disabled />
          <div className="sm:col-span-2">
            <Input label="Commercial Driving License" value="DL-2021-00984 (Verified)" disabled />
          </div>
        </div>
      </div>
    </div>
  );
};
