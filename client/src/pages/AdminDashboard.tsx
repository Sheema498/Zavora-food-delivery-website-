import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService.js';
import { useSocket } from '../context/SocketContext.js';
import { StatCard } from '../components/common/StatCard.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { formatCurrency } from '../utils/formatters.js';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Bike,
  RadioTower,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';

export const AdminDashboard: React.FC = () => {
  const { socket } = useSocket();
  const [stats, setStats] = useState<any>(null);
  const [liveOrders, setLiveOrders] = useState<any[]>([]);

  const fetchAdminData = async () => {
    try {
      const [statsData, ordersData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getLiveOrders(),
      ]);
      setStats(statsData);
      setLiveOrders(ordersData);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('order:created', fetchAdminData);
    socket.on('order:status-changed', fetchAdminData);
    socket.on('driver:status-changed', fetchAdminData);

    return () => {
      socket.off('order:created', fetchAdminData);
      socket.off('order:status-changed', fetchAdminData);
      socket.off('driver:status-changed', fetchAdminData);
    };
  }, [socket]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-purple-200 uppercase tracking-wider">
              Executive Platform Ops
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Sockets Gateway Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Admin Control Center</h1>
          <p className="text-xs text-slate-500">
            Real-time platform GMV, commission telemetry, dispatch monitoring & audit logs
          </p>
        </div>

        <Link to="/admin/live-orders">
          <Button variant="primary" size="sm" icon={<RadioTower className="w-4 h-4" />}>
            Open Live Dispatch Board
          </Button>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Platform Gross GMV"
          value={formatCurrency(stats?.totalGmv || 0)}
          subtitle="All completed orders"
          icon={<DollarSign className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Net Platform Commission"
          value={formatCurrency(stats?.platformCommission || 0)}
          subtitle="15% platform take"
          icon={<TrendingUp className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Active Live Orders"
          value={stats?.activeOrders || 0}
          subtitle="In kitchen / on road"
          icon={<ShoppingBag className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Online Couriers"
          value={`${stats?.onlineDrivers || 0} / ${stats?.totalDrivers || 0}`}
          subtitle="Fleet availability"
          icon={<Bike className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Revenue Trend Visualizer */}
      {stats?.revenueTrend && stats.revenueTrend.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Revenue Velocity</h3>
              <p className="text-xs text-slate-500">Gross sales performance over the past week</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end pt-4 h-44">
            {stats.revenueTrend.map((day: any, idx: number) => {
              const maxRev = Math.max(...stats.revenueTrend.map((d: any) => d.revenue), 1000);
              const heightPercent = Math.max(12, Math.round((day.revenue / maxRev) * 100));

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-700 hidden sm:block">
                    {formatCurrency(day.revenue)}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-brand-500 to-amber-400 rounded-xl transition-all duration-500 shadow-sm"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-slate-400 font-semibold truncate w-full text-center">
                    {new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Active Orders Quick Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Live Active Orders ({liveOrders.length})</h3>
            <p className="text-xs text-slate-500">Orders currently moving through the system</p>
          </div>
          <Link
            to="/admin/live-orders"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Dispatch View <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {liveOrders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No active orders in progress right now.</p>
        ) : (
          <div className="space-y-3">
            {liveOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Order #{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Restaurant: <strong className="text-slate-800">{order.restaurant.name}</strong> •{' '}
                    Customer: <strong className="text-slate-800">{order.customer?.name}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="text-xs font-black text-slate-900">
                    {formatCurrency(order.totalAmount)}
                  </span>
                  <Link to={`/orders/${order.id}/track`}>
                    <Button variant="outline" size="xs">
                      Inspect Live GPS
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
