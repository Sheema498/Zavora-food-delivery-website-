import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService.js';
import { useSocket } from '../context/SocketContext.js';
import { StatCard } from '../components/common/StatCard.js';
import { formatCurrency } from '../utils/formatters.js';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
  PieChart,
  Calendar,
  Layers,
  ChefHat,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';

export const AdminDashboard: React.FC = () => {
  const { socket } = useSocket();
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedRange, setSelectedRange] = useState<'today' | 'yesterday' | '7days' | '30days' | 'monthly'>('7days');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAdminData = async () => {
    try {
      const [statsData, analyticsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAnalytics(selectedRange),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load super admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [selectedRange]);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => {
      fetchAdminData();
    };
    socket.on('order:created', handleRefresh);
    socket.on('order:status-changed', handleRefresh);
    socket.on('driver:status-changed', handleRefresh);

    return () => {
      socket.off('order:created', handleRefresh);
      socket.off('order:status-changed', handleRefresh);
      socket.off('driver:status-changed', handleRefresh);
    };
  }, [socket, selectedRange]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-purple-200 uppercase tracking-wider">
              Single-Restaurant Business Intelligence
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Aggregations
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Zavora Executive Overview</h1>
          <p className="text-xs text-slate-500">
            Real database analytics for sales, item-by-item food performance, and category metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/orders">
            <Button variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700 font-bold rounded-2xl">
              Inspect All Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Restaurant Sales"
          value={formatCurrency(stats?.totalSales || 0)}
          subtitle="Delivered food volume"
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Total Orders Placed"
          value={stats?.totalOrders || 0}
          subtitle={`${stats?.completedOrders || 0} completed deliveries`}
          icon={<ShoppingBag className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(stats?.averageOrderValue || 0)}
          subtitle="Revenue per basket"
          icon={<TrendingUp className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Active Customers"
          value={stats?.customerCount || 0}
          subtitle="Registered diner accounts"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Operational Personnel Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Restaurant Manager Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
              <ChefHat className="w-4 h-4" />
              <span>Restaurant Manager</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              Active on Duty
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{stats?.managerActivity?.name || 'Chef Rajesh Sharma'}</h3>
            <p className="text-xs text-slate-500">{stats?.managerActivity?.email || 'manager@zavora.com'}</p>
          </div>
          <p className="text-xs text-slate-600">
            Responsible for kitchen order confirmations, cooking preparation states, and courier assignment.
          </p>
        </div>

        {/* Dedicated Delivery Boy Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider">
              <Bike className="w-4 h-4" />
              <span>Dedicated Delivery Boy</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              stats?.deliveryBoyActivity?.isOnline
                ? 'bg-teal-50 text-teal-700 border-teal-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {stats?.deliveryBoyActivity?.isOnline ? '🟢 Online' : '⚪ Offline'}
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{stats?.deliveryBoyActivity?.name || 'Kiran Kumar'}</h3>
            <p className="text-xs text-slate-500">
              Vehicle: {stats?.deliveryBoyActivity?.vehicle || 'KA-01-ZV-1001'} • {stats?.deliveryBoyActivity?.totalDeliveries || 0} lifetime deliveries
            </p>
          </div>
          <p className="text-xs text-slate-600">
            Assigned to all Zavora deliveries. Streams private GPS telemetry strictly to ordering customers.
          </p>
        </div>
      </div>

      {/* Date Range Analytics Filter Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Database Sales Analytics</h2>
            <p className="text-xs text-slate-500">Real database aggregations across date intervals</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { label: 'Today', value: 'today' },
              { label: 'Yesterday', value: 'yesterday' },
              { label: 'Last 7 Days', value: '7days' },
              { label: 'Last 30 Days', value: '30days' },
              { label: 'Monthly', value: 'monthly' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedRange(tab.value as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRange === tab.value
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Highlights */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Orders</p>
              <p className="text-lg font-black text-slate-900">{analytics.totalOrders}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Dishes Sold</p>
              <p className="text-lg font-black text-slate-900">{analytics.itemsSold}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Sales</p>
              <p className="text-lg font-black text-emerald-600">{formatCurrency(analytics.totalSales)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Basket</p>
              <p className="text-lg font-black text-slate-900">{formatCurrency(analytics.averageOrderValue)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Completed</p>
              <p className="text-lg font-black text-teal-600">{analytics.completedDeliveries}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Cancelled</p>
              <p className="text-lg font-black text-rose-600">{analytics.cancelledOrders}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Declined</p>
              <p className="text-lg font-black text-amber-600">{analytics.rejectedOrders}</p>
            </div>
          </div>
        )}

        {/* Food Performance Table */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-brand-600" />
              <span>Food Item Sales Performance</span>
            </h3>
            <span className="text-xs text-slate-500">Sorted by revenue contribution</span>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Food Item Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">Quantity Sold</th>
                  <th className="px-4 py-3 text-right">Total Revenue</th>
                  <th className="px-4 py-3 text-center">% of Total Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {analytics?.foodPerformance?.length > 0 ? (
                  analytics.foodPerformance.map((item: any) => (
                    <tr key={item.foodName} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-bold text-slate-800">{item.foodName}</td>
                      <td className="px-4 py-3 text-slate-500">{item.categoryName}</td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-700">
                        {item.quantitySold} units
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        {formatCurrency(item.totalRevenue)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold">
                          {item.percentageOfOrders}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No food items sold in this date range
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Analytics Table */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Category Analytics Breakdown</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics?.categoryAnalytics?.map((cat: any) => (
              <div key={cat.category} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{cat.category}</span>
                  <span className="text-xs font-black text-emerald-600">{formatCurrency(cat.revenue)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{cat.orders} orders placed</span>
                  <span>{cat.quantitySold} items cooked</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
