import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService.js';
import { useSocket } from '../context/SocketContext.js';
import { Order } from '../types/index.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Button } from '../components/ui/Button.js';
import { OrderActionModal } from '../components/restaurant/OrderActionModal.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import { ShoppingBag, Clock } from 'lucide-react';

export const RestaurantOrders: React.FC = () => {
  const { socket } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedOrderForAction, setSelectedOrderForAction] = useState<{
    order: Order;
    type: 'ACCEPT' | 'REJECT';
  } | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getRestaurantOrders(statusFilter, 1, 50);
      setOrders(data.orders);
    } catch (err) {
      console.error('Failed to load restaurant orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  useEffect(() => {
    if (!socket) return;
    socket.on('order:created', fetchOrders);
    socket.on('order:status-changed', fetchOrders);
    return () => {
      socket.off('order:created', fetchOrders);
      socket.off('order:status-changed', fetchOrders);
    };
  }, [socket, statusFilter]);

  const handleAdvanceStatus = async (orderId: string, nextStatus: any) => {
    try {
      await orderService.updateStatus(orderId, nextStatus);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
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
      fetchOrders();
      setSelectedOrderForAction(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    }
  };

  const tabs = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'PENDING', label: 'Incoming Placed' },
    { key: 'RESTAURANT_ACCEPTED', label: 'Accepted' },
    { key: 'PREPARING', label: 'Cooking (Preparing)' },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
    { key: 'DELIVERED', label: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Kitchen Orders Queue</h1>
        <p className="text-xs text-slate-500">
          Manage kitchen prep, packaging, and hand-off to delivery partners
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === tab.key
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
          <ShoppingBag className="w-12 h-12 mx-auto stroke-[1.5] mb-2 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No orders found in this status</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-card transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Order #{order.orderNumber}
                    </h3>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customer: <strong className="text-slate-800">{order.customer?.name}</strong> •{' '}
                    Placed {formatDateTime(order.createdAt)}
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
                {order.items.map((item: any) => (
                  <span
                    key={item.id}
                    className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl font-medium text-slate-800"
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

      {/* Action Modal */}
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
