import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const AdminLiveOrders: React.FC = () => {
  const { socket } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
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
