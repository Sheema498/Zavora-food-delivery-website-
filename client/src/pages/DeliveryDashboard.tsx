import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { deliveryService } from '../services/deliveryService.js';
import { useSocket } from '../context/SocketContext.js';
import { Order } from '../types/index.js';
import { StatCard } from '../components/common/StatCard.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Button } from '../components/ui/Button.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import {
  DollarSign,
  Star,
  CheckCircle2,
  Navigation,
  Radio,
  Bike,
  Clock,
  ArrowRight,
  MapPin,
  Store,
  AlertCircle,
} from 'lucide-react';

export const DeliveryDashboard: React.FC = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState<any>(null);
  const [activeDelivery, setActiveDelivery] = useState<Order | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);

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
    } finally {
      setIsLoading(false);
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
    socket.on('order:delivered', handleAssignment);

    return () => {
      socket.off('delivery:assigned', handleAssignment);
      socket.off('order:status-changed', handleAssignment);
      socket.off('order:delivered', handleAssignment);
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

  const handleAcceptAssignment = async (orderId: string) => {
    try {
      setIsAccepting(true);
      await deliveryService.acceptAssignment(orderId);
      navigate('/delivery/active');
    } catch (err: any) {
      alert(err.message || 'Failed to accept delivery assignment');
    } finally {
      setIsAccepting(false);
    }
  };

  let parsedAddress: any = { streetAddress: 'Bengaluru', phone: '+91 98765 43210' };
  if (activeDelivery) {
    try {
      parsedAddress = JSON.parse(activeDelivery.deliveryAddressSnapshot);
    } catch {}
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-teal-200 uppercase tracking-wider">
              Zavora Dedicated Courier
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Courier Dispatch Console</h1>
          <p className="text-xs text-slate-500">
            Accept assigned deliveries from Zavora kitchen and stream real-time GPS coordinates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleOnline}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isOnline ? 'bg-teal-500 text-white hover:bg-teal-600' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isOnline ? '🟢 On Duty (Online)' : '⚪ Off Duty (Offline)'}
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Deliveries"
          value={earnings?.todayDeliveries || 0}
          subtitle="Completed today"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Today's Earnings"
          value={formatCurrency(earnings?.todayEarnings || 0)}
          subtitle="₹45 / trip payout"
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="All-Time Deliveries"
          value={earnings?.totalDeliveries || 0}
          subtitle="Lifetime successfully delivered"
          icon={<Bike className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Courier Rating"
          value={`${earnings?.rating || 4.9} ★`}
          subtitle="Customer satisfaction"
          icon={<Star className="w-5 h-5" />}
          color="brand"
        />
      </div>

      {/* Active Assignment / Live Mission Card */}
      {activeDelivery ? (
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-800/80 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse text-teal-400" />
                <span>Active Delivery Mission</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Order #{activeDelivery.orderNumber}
              </h2>
            </div>
            <StatusBadge status={activeDelivery.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup Info */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Store className="w-4 h-4" />
                <span>Pick Up At</span>
              </div>
              <p className="text-sm font-bold text-white">{activeDelivery.restaurant?.name || 'Zavora Restaurant'}</p>
              <p className="text-xs text-slate-300">{activeDelivery.restaurant?.address || '88 Brigade Road, Ashok Nagar, Bengaluru'}</p>
            </div>

            {/* Customer Drop-off */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
                <MapPin className="w-4 h-4" />
                <span>Drop Off At</span>
              </div>
              <p className="text-sm font-bold text-white">{parsedAddress.recipientName || activeDelivery.customer?.name}</p>
              <p className="text-xs text-slate-300">{parsedAddress.streetAddress}</p>
              <p className="text-xs text-teal-300 font-bold">Phone: {parsedAddress.phone || activeDelivery.customer?.phone}</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-teal-200">
              Trip Earning: <strong className="text-white text-sm">₹45.00</strong>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {activeDelivery.status === 'DELIVERY_ASSIGNED' ? (
                <Button
                  onClick={() => handleAcceptAssignment(activeDelivery.id)}
                  isLoading={isAccepting}
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-lg"
                >
                  Accept Assignment & Start 🛵
                </Button>
              ) : (
                <Link
                  to="/delivery/active"
                  className="w-full sm:w-auto px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg text-center flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open Live GPS Navigation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Bike className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No active delivery right now</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You are on duty! As soon as the Zavora kitchen marks an order ready for pickup and assigns you, it will appear here with an alert.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
