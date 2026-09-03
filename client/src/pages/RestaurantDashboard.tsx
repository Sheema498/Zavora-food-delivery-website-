import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService.js';
import { orderService } from '../services/orderService.js';
import { useSocket } from '../context/SocketContext.js';
import { Order, OrderStatus } from '../types/index.js';
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
  ChefHat,
  Bike,
  PackageCheck,
  Flame,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
} from 'lucide-react';

export const RestaurantDashboard: React.FC = () => {
  const { socket } = useSocket();
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);

  const [selectedOrderForAction, setSelectedOrderForAction] = useState<{
    order: Order;
    type: 'ACCEPT' | 'REJECT';
  } | null>(null);

  const loadDashboardData = async () => {
    try {
      const [statsData, ordersData] = await Promise.all([
        restaurantService.getPortalStats(),
        orderService.getRestaurantOrders(selectedStatusTab, 1, 30),
      ]);
      setStats(statsData);
      setOrders(ordersData.orders);
    } catch (err) {
      console.error('Failed to load manager dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedStatusTab]);

  useEffect(() => {
    if (!socket) return;

    const handleRefresh = () => {
      loadDashboardData();
    };

    socket.on('order:created', handleRefresh);
    socket.on('order:status-changed', handleRefresh);

    return () => {
      socket.off('order:created', handleRefresh);
      socket.off('order:status-changed', handleRefresh);
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

  const handleActionConfirm = async (options: {
    estimatedPrepMinutes?: number;
    rejectionReason?: string;
  }) => {
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

  const handleAdvanceStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await orderService.updateStatus(orderId, nextStatus);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleAssignDeliveryBoy = async (orderId: string) => {
    try {
      setIsAssigning(orderId);
      await orderService.assignDeliveryBoy(orderId);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign delivery boy');
    } finally {
      setIsAssigning(null);
    }
  };

  // Status counts
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const kitchenCount = orders.filter((o) => ['RESTAURANT_ACCEPTED', 'PREPARING'].includes(o.status)).length;
  const readyCount = orders.filter((o) => o.status === 'READY_FOR_PICKUP').length;
  const outForDeliveryCount = orders.filter((o) =>
    ['DELIVERY_ASSIGNED', 'DELIVERY_ACCEPTED', 'ARRIVED_AT_RESTAURANT', 'PICKED_UP', 'ON_THE_WAY'].includes(
      o.status
    )
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-orange-200 uppercase tracking-wider">
              Zavora Kitchen Operations
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Orders Stream
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Restaurant Kitchen Dashboard</h1>
          <p className="text-xs text-slate-500">
            Accept incoming orders, coordinate fresh preparation, and assign our dedicated courier.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleStoreStatus}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isOpen
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isOpen ? '🟢 Kitchen is ACCEPTING Orders' : '🔴 Kitchen is CLOSED'}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Approvals"
          value={pendingCount}
          subtitle="Awaiting kitchen confirmation"
          icon={<Clock className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Cooking in Kitchen"
          value={kitchenCount}
          subtitle="Currently on the flame"
          icon={<Flame className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Ready for Courier"
          value={readyCount}
          subtitle="Packed & awaiting dispatch"
          icon={<PackageCheck className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          subtitle="Total delivered orders"
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Orders Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-white p-2 rounded-2xl border border-slate-100 shadow-xs">
        {[
          { label: 'All Active Queue', value: 'ALL' },
          { label: `Pending (${pendingCount})`, value: 'PENDING' },
          { label: 'Cooking (PREPARING)', value: 'PREPARING' },
          { label: `Ready (${readyCount})`, value: 'READY_FOR_PICKUP' },
          { label: 'Out with Courier', value: 'ON_THE_WAY' },
          { label: 'Completed Deliveries', value: 'DELIVERED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatusTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatusTab === tab.value
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Orders List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-slate-900">Incoming Orders & State Actions</h2>
          <span className="text-xs text-slate-400 font-semibold">{orders.length} orders in view</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto stroke-[1.5] mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No orders in this state</p>
            <p className="text-xs text-slate-400 mt-1">
              Orders update dynamically in real-time as customers place them
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-orange-200 transition-all bg-slate-50/50 space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">
                      #{order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} size="sm" />
                    <span className="text-xs text-slate-500 font-medium">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      Customer: <strong className="text-slate-800">{order.customer?.name}</strong>
                    </span>
                    <span className="text-sm font-black text-brand-600">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {order.items.map((item) => (
                    <span
                      key={item.id}
                      className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-bold text-slate-800 shadow-2xs"
                    >
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                </div>

                {order.customerNotes && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <strong>Customer Special Instructions:</strong> "{order.customerNotes}"
                  </div>
                )}

                {/* State Machine Action Controls */}
                <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {order.deliveryBoy && (
                      <span className="inline-flex items-center gap-1.5 text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg font-bold">
                        <Bike className="w-3.5 h-3.5" />
                        <span>Courier: {order.deliveryBoy.user?.name || 'Kiran Kumar (KA-01-ZV-1001)'}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* State: PENDING -> ACCEPT or REJECT */}
                    {order.status === 'PENDING' && (
                      <>
                        <Button
                          onClick={() => setSelectedOrderForAction({ order, type: 'REJECT' })}
                          variant="danger"
                          size="sm"
                          className="font-bold rounded-xl"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline Order
                        </Button>
                        <Button
                          onClick={() => setSelectedOrderForAction({ order, type: 'ACCEPT' })}
                          variant="primary"
                          size="sm"
                          className="font-bold rounded-xl bg-orange-500 hover:bg-orange-600"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept & Set Prep Time
                        </Button>
                      </>
                    )}

                    {/* State: RESTAURANT_ACCEPTED -> START PREPARING */}
                    {order.status === 'RESTAURANT_ACCEPTED' && (
                      <Button
                        onClick={() => handleAdvanceStatus(order.id, 'PREPARING')}
                        variant="primary"
                        size="sm"
                        className="font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Flame className="w-4 h-4 mr-1" />
                        Start Cooking (Mark Preparing)
                      </Button>
                    )}

                    {/* State: PREPARING -> MARK READY FOR PICKUP */}
                    {order.status === 'PREPARING' && (
                      <Button
                        onClick={() => handleAdvanceStatus(order.id, 'READY_FOR_PICKUP')}
                        variant="success"
                        size="sm"
                        className="font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <PackageCheck className="w-4 h-4 mr-1" />
                        Mark Ready for Pickup 📦
                      </Button>
                    )}

                    {/* State: READY_FOR_PICKUP -> ASSIGN DELIVERY BOY */}
                    {order.status === 'READY_FOR_PICKUP' && (
                      <Button
                        onClick={() => handleAssignDeliveryBoy(order.id)}
                        isLoading={isAssigning === order.id}
                        variant="primary"
                        size="sm"
                        className="font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Assign Zavora Delivery Boy</span>
                      </Button>
                    )}

                    {/* In-Transit Status Indicators */}
                    {order.status === 'DELIVERY_ASSIGNED' && (
                      <span className="text-xs text-cyan-700 bg-cyan-50 border border-cyan-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting Courier Confirmation</span>
                      </span>
                    )}

                    {order.status === 'DELIVERY_ACCEPTED' && (
                      <span className="text-xs text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                        <Bike className="w-3.5 h-3.5" />
                        <span>Courier Accepted — Heading to Kitchen</span>
                      </span>
                    )}

                    {order.status === 'ARRIVED_AT_RESTAURANT' && (
                      <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Courier at Door — Hand Over Food Package</span>
                      </span>
                    )}

                    {order.status === 'PICKED_UP' && (
                      <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Food Handed to Courier</span>
                      </span>
                    )}

                    {order.status === 'ON_THE_WAY' && (
                      <span className="text-xs text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                        <Bike className="w-3.5 h-3.5" />
                        <span>En Route to Customer Doorstep</span>
                      </span>
                    )}

                    {order.status === 'DELIVERED' && (
                      <span className="text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Delivered Successfully</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Action Modal (Accept / Reject) */}
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
