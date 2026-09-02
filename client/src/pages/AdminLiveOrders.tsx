import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const AdminLiveOrders: React.FC = () => {
  const { socket } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Order | null>(null);

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

        <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
          {orders.length} Active System Orders
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
          <Bike className="w-12 h-12 mx-auto stroke-[1.5] mb-2 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No active orders right now</h3>
          <p className="text-xs text-slate-400 mt-1">
            Live orders moving through the platform will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
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
                {/* Header */}
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

                    {/* Dispatch Button */}
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

                {/* Restaurant & Customer & Driver Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 block mb-1">
                      Restaurant
                    </span>
                    <p className="font-bold text-slate-900">{order.restaurant.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{order.restaurant.phone}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                      Customer
                    </span>
                    <p className="font-bold text-slate-900">{order.customer?.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{order.customer?.phone}</p>
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
                </div>

                {/* Order Items */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {order.items.map((item) => (
                    <span
                      key={item.id}
                      className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg font-medium"
                    >
                      {item.quantity}x {item.name}
                    </span>
                  ))}
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
