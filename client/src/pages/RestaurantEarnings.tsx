import React, { useState, useEffect } from 'react';
import { restaurantService } from '../services/restaurantService.js';
import { orderService } from '../services/orderService.js';
import { Order } from '../types/index.js';
import { StatCard } from '../components/common/StatCard.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import { DollarSign, TrendingUp, Percent } from 'lucide-react';

export const RestaurantEarnings: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          restaurantService.getPortalStats(),
          orderService.getRestaurantOrders('DELIVERED', 1, 20),
        ]);
        setStats(statsData);
        setOrders(ordersData.orders);
      } catch (err) {
        console.error('Failed to load restaurant earnings:', err);
      }
    };

    fetchData();
  }, []);

  const totalRevenue = stats?.totalRevenue || 0;
  const commission = totalRevenue * 0.15;
  const netEarnings = totalRevenue * 0.85;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Earnings & Financial Reports</h1>
        <p className="text-xs text-slate-500">
          Track sales volumes, 15% platform commission breakdowns, and net restaurant disbursements
        </p>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Gross Food Sales (GMV)"
          value={formatCurrency(totalRevenue)}
          subtitle="Delivered customer orders"
          icon={<DollarSign className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Platform Commission (15%)"
          value={formatCurrency(commission)}
          subtitle="Technology & gateway fee"
          icon={<Percent className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Net Restaurant Payout (85%)"
          value={formatCurrency(netEarnings)}
          subtitle="Direct bank settlement"
          icon={<TrendingUp className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Recent Delivered Transactions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Settlement Transactions</h3>
            <p className="text-xs text-slate-500">Breakdown per delivered order</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No completed delivery settlements yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Delivered At</th>
                  <th className="p-3">Gross Total</th>
                  <th className="p-3">Fee (15%)</th>
                  <th className="p-3 rounded-r-xl">Net Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((order) => {
                  const fee = order.totalAmount * 0.15;
                  const payout = order.totalAmount * 0.85;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">#{order.orderNumber}</td>
                      <td className="p-3 text-slate-700">{order.customer?.name}</td>
                      <td className="p-3 text-slate-500">{formatDateTime(order.deliveredAt || order.createdAt)}</td>
                      <td className="p-3 font-bold text-slate-900">{formatCurrency(order.totalAmount)}</td>
                      <td className="p-3 text-slate-500">- {formatCurrency(fee)}</td>
                      <td className="p-3 font-black text-emerald-600">{formatCurrency(payout)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
