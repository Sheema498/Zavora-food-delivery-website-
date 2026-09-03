import React, { useState, useEffect } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService.js';
import { useSocket } from '../context/SocketContext.js';
import { Order } from '../types/index.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Button } from '../components/ui/Button.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import {
  Bike,
  Eye,
  Store,
  MapPin,
  Calendar,
  CreditCard,
  User,
  Clock,
  CheckCircle2,
  X,
  Package,
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
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
  // Filters (Section 14)
  const [restaurantFilter, setRestaurantFilter] = useState<string>('ALL');
  const [driverFilter, setDriverFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  const fetchLiveOrders = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.listOrders(1, 50);
      setOrders(data.orders);
    } catch (err) {
      console.error('Failed to load orders for admin inspection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => {
      fetchOrders();
    };
    socket.on('order:created', handleRefresh);
    socket.on('order:status-changed', handleRefresh);

    return () => {
      socket.off('order:created', handleRefresh);
      socket.off('order:status-changed', handleRefresh);
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-purple-200 uppercase tracking-wider">
              Audit & Oversight Matrix
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Order Stream
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Order Inspection & Audit Trail</h1>
          <p className="text-xs text-slate-500">
            Inspect complete order workflows: customer, dishes, prices, payments, kitchen prep, and courier handoff. (GPS Privacy Enforced).
          </p>
        </div>

        <span className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-2xl">
          {orders.length} Total Orders Inspected
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Order #</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Total Amount</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Assigned Courier</th>
                <th className="px-5 py-4">Created At</th>
                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders found in database
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const courier = order.deliveryBoy || order.deliveryPartner;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-black text-slate-900">#{order.orderNumber}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">{order.customer?.name || 'Customer'}</p>
                        <p className="text-[11px] text-slate-400">{order.customer?.phone || order.customer?.email}</p>
                      </td>
                      <td className="px-5 py-4 font-black text-emerald-600">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[10px]">
                          {order.paymentMethod === 'ONLINE_DEMO_PAY' ? 'ONLINE (PAID)' : 'CASH ON DELIVERY'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="px-5 py-4">
                        {courier ? (
                          <span className="text-teal-700 font-bold flex items-center gap-1">
                            <Bike className="w-3.5 h-3.5" />
                            <span>{courier.user?.name || 'Kiran Kumar'}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => setInspectedOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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

      {/* Super Admin Complete Order Inspection Modal */}
      {inspectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">
                  Complete Lifecycle Audit
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  Order Inspection — #{inspectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setInspectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lifecycle Status & Timestamps */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Current Status</p>
                <StatusBadge status={inspectedOrder.status} size="sm" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Placed At</p>
                <p className="font-bold text-slate-800">{formatDateTime(inspectedOrder.placedAt || inspectedOrder.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Kitchen Acceptance</p>
                <p className="font-bold text-slate-800">
                  {inspectedOrder.acceptedAt ? formatDateTime(inspectedOrder.acceptedAt) : 'Pending'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Delivered At</p>
                <p className="font-bold text-slate-800">
                  {inspectedOrder.deliveredAt ? formatDateTime(inspectedOrder.deliveredAt) : 'In progress'}
                </p>
              </div>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Profile</p>
                <p className="font-bold text-slate-900 text-sm">{inspectedOrder.customer?.name}</p>
                <p className="text-slate-500">{inspectedOrder.customer?.email}</p>
                <p className="text-slate-500">{inspectedOrder.customer?.phone}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Delivery Address</p>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {(() => {
                    try {
                      const addr = JSON.parse(inspectedOrder.deliveryAddressSnapshot);
                      return `${addr.streetAddress}, ${addr.city} - ${addr.postalCode}`;
                    } catch {
                      return inspectedOrder.deliveryAddressSnapshot;
                    }
                  })()}
                </p>
              </div>
            </div>
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

            {/* Food Items & Quantities */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Ordered Food Items & Pricing Breakdown
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-3 text-xs space-y-2">
                {inspectedOrder.items.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="text-slate-400 ml-2">x{item.quantity} @ ₹{item.unitPrice}</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(inspectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (5%):</span>
                <span>{formatCurrency(inspectedOrder.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee:</span>
                <span>{formatCurrency(inspectedOrder.deliveryFee)}</span>
              </div>
              {inspectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount:</span>
                  <span>-{formatCurrency(inspectedOrder.discountAmount)}</span>

                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
                      State & Payment
                    </span>
                    <p className="font-bold text-slate-900">{calculateElapsedTime(order.updatedAt)}</p>
                    <p className="text-slate-500 text-[11px] truncate">{order.paymentMethod.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-emerald-600">{formatCurrency(inspectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Privacy Compliance Banner */}
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-[11px] text-purple-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                GPS Privacy Notice: Live GPS telemetry is restricted to the Customer and Delivery Boy. Super Admin inspection has access to full timestamps and order audit states without GPS exposure.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
