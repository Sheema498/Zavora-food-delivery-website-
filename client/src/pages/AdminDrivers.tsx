import React, { useState, useEffect } from 'react';
import { deliveryService } from '../services/deliveryService.js';
import { useSocket } from '../context/SocketContext.js';
import { Bike, Star } from 'lucide-react';

export const AdminDrivers: React.FC = () => {
  const { socket } = useSocket();
  const [drivers, setDrivers] = useState<any[]>([]);

  const fetchDrivers = async () => {
    try {
      const data = await deliveryService.getAvailableDrivers();
      setDrivers(data);
    } catch (err) {
      console.error('Failed to load drivers:', err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('driver:status-changed', fetchDrivers);
    socket.on('delivery:location-updated', fetchDrivers);

    return () => {
      socket.off('driver:status-changed', fetchDrivers);
      socket.off('delivery:location-updated', fetchDrivers);
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Courier Fleet Operations</h1>
          <p className="text-xs text-slate-500">
            Real-time courier GPS availability, vehicles, and live active delivery tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
            {drivers.filter((d) => d.isOnline).length} Couriers Online
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((driver) => (
          <div
            key={driver.id}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Bike className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{driver.name}</h4>
                  <p className="text-xs text-slate-500">{driver.phone || 'No phone'}</p>
                </div>
              </div>

              {driver.isOnline ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Online
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Offline
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Transport</span>
                <span className="font-semibold text-slate-900">{driver.vehicleType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Vehicle #</span>
                <span className="font-semibold text-slate-900">{driver.vehicleNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Rating</span>
                <span className="font-bold text-amber-600 flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {driver.rating.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Trips Completed</span>
                <span className="font-semibold text-slate-900">{driver.totalDeliveries}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Active Orders: <strong className="text-slate-900">{driver.activeOrdersCount}</strong></span>
              <span className="text-sky-600 font-semibold">
                GPS: {driver.currentLatitude.toFixed(3)}, {driver.currentLongitude.toFixed(3)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
