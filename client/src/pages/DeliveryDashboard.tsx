import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryService } from '../services/deliveryService.js';
import { useSocket } from '../context/SocketContext.js';
import { Order } from '../types/index.js';
import { StatCard } from '../components/common/StatCard.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Button } from '../components/ui/Button.js';
import { formatCurrency } from '../utils/formatters.js';
import {
  DollarSign,
  Star,
  CheckCircle2,
  Navigation,
  Radio,
} from 'lucide-react';

export const DeliveryDashboard: React.FC = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState<any>(null);
  const [activeDelivery, setActiveDelivery] = useState<Order | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      const [earningsData, activeOrderData] = await Promise.all([
        deliveryService.getEarnings(),
        deliveryService.getActiveDelivery(),
      ]);
      setEarnings(earningsData);
      setActiveDelivery(activeOrderData);
    } catch (err) {
      console.error('Failed to load delivery dashboard:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleAssignment = () => {
      fetchDashboardData();
    };

    socket.on('delivery:assigned', handleAssignment);
    socket.on('order:status-changed', handleAssignment);

    return () => {
      socket.off('delivery:assigned', handleAssignment);
      socket.off('order:status-changed', handleAssignment);
    };
  }, [socket]);

  const handleToggleOnline = async () => {
    try {
      const updated = await deliveryService.toggleOnline(!isOnline);
      setIsOnline(updated.isOnline);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleAccept = async (orderId: string) => {
    try {
      await deliveryService.acceptAssignment(orderId);
      navigate('/delivery/active');
    } catch (err: any) {
      alert(err.message || 'Failed to accept delivery');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Online Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-teal-200 uppercase tracking-wider">
              Courier Operations
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> GPS Broadcast Ready
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Delivery Partner Console</h1>
          <p className="text-xs text-slate-500">
            Accept dispatch alerts, stream live road GPS coordinates, and complete doorstep deliveries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-700">Duty Status</p>
            <p className="text-[11px] text-slate-500">{isOnline ? 'Online & Available' : 'Offline / Off-Duty'}</p>
          </div>
          <button
            onClick={handleToggleOnline}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isOnline ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isOnline ? 'You are ONLINE' : 'You are OFFLINE'}
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Shift Earnings"
          value={formatCurrency(earnings?.totalEarnings || 0)}
          subtitle="Payouts & customer tips"
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Completed Deliveries"
          value={earnings?.totalDeliveries || 0}
          subtitle="Successful trips"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Courier Rating"
          value={`${(earnings?.rating || 4.8).toFixed(1)} ★`}
          subtitle="Customer satisfaction score"
          icon={<Star className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Active Delivery / Assignment Callout */}
      {activeDelivery ? (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
            <div>
              <span className="bg-sky-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Active Assigned Delivery
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                Order #{activeDelivery.orderNumber}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                From <strong className="text-white">{activeDelivery.restaurant.name}</strong> • Total:{' '}
                {formatCurrency(activeDelivery.totalAmount)}
              </p>
            </div>

            <StatusBadge status={activeDelivery.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 block mb-1">
                Pickup Restaurant
              </span>
              <p className="font-bold text-white text-sm">{activeDelivery.restaurant.name}</p>
              <p className="text-slate-400 mt-0.5">{activeDelivery.restaurant.address}</p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Customer Destination
              </span>
              <p className="font-bold text-white text-sm">{activeDelivery.customer?.name}</p>
              <p className="text-slate-400 mt-0.5">
                {JSON.parse(activeDelivery.deliveryAddressSnapshot || '{}').streetAddress}
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end">
            {activeDelivery.status === 'DELIVERY_ASSIGNED' ? (
              <Button
                onClick={() => handleAccept(activeDelivery.id)}
                variant="primary"
                size="lg"
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Accept Delivery Assignment
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/delivery/active')}
                variant="primary"
                size="lg"
                icon={<Navigation className="w-4 h-4" />}
              >
                Open Turn-by-Turn GPS Navigation
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Waiting for Delivery Assignments</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Keep your status <strong className="text-emerald-600 font-bold">ONLINE</strong>. As soon
            as an order is marked ready by a kitchen or assigned by admin, an instant alert will sound.
          </p>
        </div>
      )}
    </div>
  );
};
