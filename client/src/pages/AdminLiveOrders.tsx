import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService.js';
import { useSocket } from '../context/SocketContext.js';
import { Order } from '../types/index.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Button } from '../components/ui/Button.js';
import { AssignDriverModal } from '../components/admin/AssignDriverModal.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import {
  Bike,
  Eye,
  Filter,
  Layers,
  Table as TableIcon,
  Clock,
  MapPin,
  CreditCard,
  Building2,
} from 'lucide-react';

export const AdminLiveOrders: React.FC = () => {
  const { socket } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Order | null>(null);

  // Filters (Section 14)
  const [restaurantFilter, setRestaurantFilter] = useState<string>('ALL');
  const [driverFilter, setDriverFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  const fetchLiveOrders = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getLiveOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load live orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('order:created', fetchLiveOrders);
    socket.on('order:status-changed', fetchLiveOrders);
    socket.on('delivery:assigned', fetchLiveOrders);

    return () => {
      socket.off('order:created', fetchLiveOrders);
      socket.off('order:status-changed', fetchLiveOrders);
      socket.off('delivery:assigned', fetchLiveOrders);
    };
  }, [socket]);

  // Unique restaurants & drivers for filter dropdowns
  const uniqueRestaurants = useMemo(() => {
    const map = new Map<string, string>();
    orders.forEach((o) => {
      if (o.restaurant?.id && o.restaurant?.name) {
        map.set(o.restaurant.id, o.restaurant.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [orders]);

  const uniqueDrivers = useMemo(() => {
    const map = new Map<string, string>();
    orders.forEach((o) => {
      if (o.deliveryPartner?.id && o.deliveryPartner?.user?.name) {
        map.set(o.deliveryPartner.id, o.deliveryPartner.user.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (restaurantFilter !== 'ALL' && o.restaurantId !== restaurantFilter) return false;
      if (driverFilter !== 'ALL' && o.deliveryPartnerId !== driverFilter) return false;
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      return true;
    });
  }, [orders, restaurantFilter, driverFilter, statusFilter]);

  const calculateElapsedTime = (dateString?: string | null) => {
    if (!dateString) return '< 1m';
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m in state`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m`;
  };

  const parseDeliveryLocation = (snapshot?: string) => {
    try {
      const parsed = JSON.parse(snapshot || '{}');
      return parsed.streetAddress || parsed.city || 'Bengaluru';
    } catch {
      return 'Bengaluru';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-purple-200 uppercase tracking-wider">
              Central Dispatch Matrix
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Stream
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Live Orders & Courier Dispatch</h1>
          <p className="text-xs text-slate-500">
            Monitor real-time status progressions and manually assign/reassign delivery couriers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" /> Operations Matrix
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Cards View
            </button>
          </div>

          <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
            {filteredOrders.length} / {orders.length} Active Orders
          </span>
        </div>
      </div>

      {/* Filter Toolbar (Section 14: Filter by Restaurant, Delivery Partner, Status) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <Filter className="w-4 h-4 text-purple-600" /> Filters:
        </div>

        {/* Restaurant Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="rest-filter" className="text-slate-500 font-semibold">Restaurant:</label>
          <select
            id="rest-filter"
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="ALL">All Restaurants (6 Seeded)</option>
            {uniqueRestaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Driver Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="driver-filter" className="text-slate-500 font-semibold">Courier:</label>
          <select
            id="driver-filter"
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="ALL">All Delivery Partners (6 Dedicated)</option>
            {uniqueDrivers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="status-filter" className="text-slate-500 font-semibold">State:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="ALL">All Order States</option>
            <option value="PENDING">PENDING</option>
            <option value="RESTAURANT_ACCEPTED">RESTAURANT_ACCEPTED</option>
            <option value="PREPARING">PREPARING</option>
            <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
            <option value="DELIVERY_ASSIGNED">DELIVERY_ASSIGNED</option>
            <option value="DELIVERY_ACCEPTED">DELIVERY_ACCEPTED</option>
            <option value="ARRIVED_AT_RESTAURANT">ARRIVED_AT_RESTAURANT</option>
            <option value="PICKED_UP">PICKED_UP</option>
            <option value="ON_THE_WAY">ON_THE_WAY</option>
            <option value="DELIVERED">DELIVERED</option>
          </select>
        </div>

        {(restaurantFilter !== 'ALL' || driverFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <button
            onClick={() => {
              setRestaurantFilter('ALL');
              setDriverFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="text-purple-600 hover:text-purple-800 font-bold ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
          <Bike className="w-12 h-12 mx-auto stroke-[1.5] mb-2 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No matching orders found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your restaurant, driver, or order status filters.
          </p>
        </div>
      ) : viewMode === 'matrix' ? (
        /* Centralized Monitoring Matrix Table (Section 14) */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Restaurant</th>
                  <th className="py-3.5 px-4">Assigned Partner</th>
                  <th className="py-3.5 px-4">Current State</th>
                  <th className="py-3.5 px-4">Time in State</th>
                  <th className="py-3.5 px-4">Delivery Location</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((order) => {
                  const isReady = order.status === 'READY_FOR_PICKUP';
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        #{order.orderNumber}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="truncate max-w-[140px]">{order.restaurant.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className={order.deliveryPartner ? 'font-semibold text-slate-800' : 'text-slate-400 italic'}>
                            {order.deliveryPartner?.user?.name || 'Awaiting dispatch'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {calculateElapsedTime(order.updatedAt)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-[160px]">
                        <span className="truncate block text-slate-700" title={parseDeliveryLocation(order.deliveryAddressSnapshot)}>
                          {parseDeliveryLocation(order.deliveryAddressSnapshot)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {order.paymentMethod === 'ONLINE_DEMO_PAY' ? 'Online Paid' : 'Cash on Delivery'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/orders/${order.id}/track`}>
                            <Button variant="outline" size="xs" icon={<Eye className="w-3 h-3" />}>
                              Track
                            </Button>
                          </Link>
                          {(!order.deliveryPartner || isReady || order.status === 'DELIVERY_ASSIGNED') && (
                            <Button
                              onClick={() => setSelectedOrderForAssign(order)}
                              variant="primary"
                              size="xs"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Dispatch
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isReadyForPickup = order.status === 'READY_FOR_PICKUP';
            const hasDriver = !!order.deliveryPartner;

            return (
              <div
                key={order.id}
                className={`bg-white p-5 rounded-2xl border transition-all space-y-4 ${
                  isReadyForPickup
                    ? 'border-purple-300 ring-2 ring-purple-100 shadow-md'
                    : 'border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-slate-900">
                        Order #{order.orderNumber}
                      </h3>
                      <StatusBadge status={order.status} />
                      {isReadyForPickup && (
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse">
                          ⚡ Ready for Courier Dispatch
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Placed {formatDateTime(order.createdAt)} • Amount: {formatCurrency(order.totalAmount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/orders/${order.id}/track`}>
                      <Button variant="outline" size="xs" icon={<Eye className="w-3.5 h-3.5" />}>
                        Live GPS Map
                      </Button>
                    </Link>

                    {(!hasDriver || isReadyForPickup || order.status === 'DELIVERY_ASSIGNED') && (
                      <Button
                        onClick={() => setSelectedOrderForAssign(order)}
                        variant="primary"
                        size="xs"
                        icon={<Bike className="w-3.5 h-3.5" />}
                        className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                      >
                        {hasDriver ? 'Reassign Driver' : 'Assign Delivery Partner'}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 block mb-1">
                      Restaurant
                    </span>
                    <p className="font-bold text-slate-900">{order.restaurant.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{order.restaurant.phone}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                      Destination
                    </span>
                    <p className="font-bold text-slate-900">{order.customer?.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{parseDeliveryLocation(order.deliveryAddressSnapshot)}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block mb-1">
                      Assigned Courier
                    </span>
                    <p className="font-bold text-slate-900">
                      {order.deliveryPartner?.user?.name || 'Unassigned (Waiting)'}
                    </p>
                    <p className="text-slate-500 text-[11px] truncate">
                      {order.deliveryPartner?.vehicleType || 'None'}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
                      State & Payment
                    </span>
                    <p className="font-bold text-slate-900">{calculateElapsedTime(order.updatedAt)}</p>
                    <p className="text-slate-500 text-[11px] truncate">{order.paymentMethod.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Driver Assignment Modal */}
      {selectedOrderForAssign && (
        <AssignDriverModal
          isOpen={!!selectedOrderForAssign}
          onClose={() => setSelectedOrderForAssign(null)}
          order={selectedOrderForAssign}
          onDriverAssigned={() => fetchLiveOrders()}
        />
      )}
    </div>
  );
};
