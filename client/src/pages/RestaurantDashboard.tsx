import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService.js';
import { orderService } from '../services/orderService.js';
import { useSocket } from '../context/SocketContext.js';
import { Order } from '../types/index.js';
import { StatCard } from '../components/common/StatCard.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Button } from '../components/ui/Button.js';
import { OrderActionModal } from '../components/restaurant/OrderActionModal.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export const RestaurantDashboard: React.FC = () => {
  const { socket } = useSocket();
  const [stats, setStats] = useState<any>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const [selectedOrderForAction, setSelectedOrderForAction] = useState<{
    order: Order;
    type: 'ACCEPT' | 'REJECT';
  } | null>(null);

  const loadDashboardData = async () => {
    try {
      const [statsData, ordersData] = await Promise.all([
        restaurantService.getPortalStats(),
        orderService.getRestaurantOrders('ALL', 1, 10),
      ]);
      setStats(statsData);
      setActiveOrders(ordersData.orders);
    } catch (err) {
      console.error('Failed to load restaurant dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Listen to incoming order socket events
  useEffect(() => {
    if (!socket) return;

    const handleOrderCreated = () => {
      loadDashboardData();
    };

    socket.on('order:created', handleOrderCreated);
    socket.on('order:status-changed', handleOrderCreated);

    return () => {
      socket.off('order:created', handleOrderCreated);
      socket.off('order:status-changed', handleOrderCreated);
    };
  }, [socket]);

  const handleToggleStoreStatus = async () => {
    try {
      const updated = await restaurantService.toggleStatus(!isOpen);
      setIsOpen(updated.isOpen);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleActionConfirm = async (options: { estimatedPrepMinutes?: number; rejectionReason?: string }) => {
    if (!selectedOrderForAction) return;
    const { order, type } = selectedOrderForAction;

    try {
      if (type === 'ACCEPT') {
        await orderService.updateStatus(order.id, 'RESTAURANT_ACCEPTED', {
          estimatedPrepMinutes: options.estimatedPrepMinutes,
        });
      } else {
        await orderService.updateStatus(order.id, 'RESTAURANT_REJECTED', {
          rejectionReason: options.rejectionReason,
        });
      }
      loadDashboardData();
      setSelectedOrderForAction(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    }
  };

  const handleAdvanceStatus = async (orderId: string, nextStatus: any) => {
    try {
      await orderService.updateStatus(orderId, nextStatus);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Kitchen Open/Closed Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-blue-200 uppercase tracking-wider">
              Live Kitchen Ops
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Sockets Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Restaurant Overview</h1>
          <p className="text-xs text-slate-500">
            Real-time incoming orders, preparation timers & kitchen performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-700">Kitchen Status</p>
            <p className="text-[11px] text-slate-500">{isOpen ? 'Accepting Orders' : 'Offline / Closed'}</p>
          </div>
          <button
            onClick={handleToggleStoreStatus}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isOpen ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isOpen ? 'Store is OPEN' : 'Store is CLOSED'}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Live Orders"
          value={stats?.pendingOrders || 0}
          subtitle="Orders requiring action"
          icon={<ShoppingBag className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Today's Orders"
          value={stats?.todayOrders || 0}
          subtitle="Placed since midnight"
          icon={<Clock className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Total Gross Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          subtitle="Completed deliveries"
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Net Kitchen Payout"
          value={formatCurrency(stats?.netEarnings || 0)}
          subtitle="85% payout (15% platform fee)"
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Active Orders Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Live Orders Queue</h2>
            <p className="text-xs text-slate-500">
              Orders update automatically in real-time when placed by customers
            </p>
          </div>

          <Link
            to="/restaurant/orders"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Full Orders Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <ShoppingBag className="w-10 h-10 mx-auto stroke-[1.5] mb-2 text-slate-300" />
            <p className="text-sm font-semibold">No active incoming orders</p>
            <p className="text-xs text-slate-400 mt-1">
              New customer orders will chime here immediately
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        Order #{order.orderNumber}
                      </h3>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Customer: <strong className="text-slate-800">{order.customer?.name}</strong> •{' '}
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-brand-600">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {order.paymentMethod.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {order.items.map((item) => (
                    <span
                      key={item.id}
                      className="bg-white border border-slate-200 px-3 py-1 rounded-xl font-medium text-slate-800"
                    >
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                </div>

                {order.customerNotes && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <strong>Customer Note:</strong> "{order.customerNotes}"
                  </div>
                )}

                {/* Action Buttons depending on status */}
                <div className="pt-2 flex flex-wrap gap-2 justify-end">
                  {order.status === 'PENDING' && (
                    <>
                      <Button
                        onClick={() =>
                          setSelectedOrderForAction({ order, type: 'REJECT' })
                        }
                        variant="danger"
                        size="xs"
                      >
                        Decline Order
                      </Button>
                      <Button
                        onClick={() =>
                          setSelectedOrderForAction({ order, type: 'ACCEPT' })
                        }
                        variant="primary"
                        size="xs"
                      >
                        Accept & Set Prep Time
                      </Button>
                    </>
                  )}

                  {order.status === 'RESTAURANT_ACCEPTED' && (
                    <Button
                      onClick={() => handleAdvanceStatus(order.id, 'PREPARING')}
                      variant="primary"
                      size="xs"
                    >
                      Mark Food as Preparing (Cooking)
                    </Button>
                  )}

                  {order.status === 'PREPARING' && (
                    <Button
                      onClick={() => handleAdvanceStatus(order.id, 'READY_FOR_PICKUP')}
                      variant="success"
                      size="xs"
                    >
                      Mark Food as Ready for Pickup 📦
                    </Button>
                  )}

                  {order.status === 'READY_FOR_PICKUP' && (
                    <div className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Ready for Pickup — Awaiting Courier Assignment
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Action Modal (Accept/Reject) */}
      {selectedOrderForAction && (
        <OrderActionModal
          isOpen={!!selectedOrderForAction}
          onClose={() => setSelectedOrderForAction(null)}
          order={selectedOrderForAction.order}
          actionType={selectedOrderForAction.type}
          onActionConfirmed={handleActionConfirm}
        />
      )}
    </div>
  );
};
