import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService.js';
import { useSocket } from '../context/SocketContext.js';
import { Order, LatLng, RestaurantReview } from '../types/index.js';
import { KeylessMap } from '../components/common/KeylessMap.js';
import { OrderTimeline } from '../components/common/OrderTimeline.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Button } from '../components/ui/Button.js';
import { ReviewModal } from '../components/customer/ReviewModal.js';
import { formatCurrency } from '../utils/formatters.js';
import {
  Bike,
  Phone,
  Store,
  MapPin,
  Star,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { Modal } from '../components/ui/Modal.js';

import { soundEffects } from '../utils/audioSynth.js';

export const LiveOrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { socket, joinOrderRoom, leaveOrderRoom } = useSocket();

  const [order, setOrder] = useState<Order | null>(null);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await orderService.getOrder(id);
        setOrder(data);

        // Initial driver coordinates if driver is assigned
        if (data.deliveryPartner) {
          setDriverLocation({
            latitude: data.deliveryPartner.currentLatitude,
            longitude: data.deliveryPartner.currentLongitude,
          });
        }
      } catch (err) {
        console.error('Failed to load order for live tracking:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Join Socket.IO room and listen for real-time live events
  useEffect(() => {
    if (!id || !socket) return;

    joinOrderRoom(id);

    const handleStatusUpdate = (data: any) => {
      if (data.orderId === id) {
        if (data.status === 'DELIVERED') {
          soundEffects.playDeliveredFanfare();
        } else {
          soundEffects.playChime();
        }

        setOrder((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: data.status,
            estimatedPrepMinutes: data.estimatedPrepMinutes || prev.estimatedPrepMinutes,
          };
        });

        if (data.status === 'DELIVERED') {
          setTimeout(() => {
            setIsReviewModalOpen(true);
          }, 1500);
        }
      }
    };

    const handleDeliveryAssigned = (data: any) => {
      if (data.orderId === id) {
        orderService.getOrder(id).then((fresh) => {
          setOrder(fresh);
          if (fresh.deliveryPartner) {
            setDriverLocation({
              latitude: fresh.deliveryPartner.currentLatitude,
              longitude: fresh.deliveryPartner.currentLongitude,
            });
          }
        });
      }
    };

    const handleLocationUpdate = (data: any) => {
      if (data.orderId === id || (order?.deliveryPartnerId && data.deliveryPartnerId === order.deliveryPartnerId)) {
        setDriverLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    };

    socket.on('order:status-changed', handleStatusUpdate);
    socket.on('order:ready', handleStatusUpdate);
    socket.on('delivery:assigned', handleDeliveryAssigned);
    socket.on('delivery:location-updated', handleLocationUpdate);

    return () => {
      leaveOrderRoom(id);
      socket.off('order:status-changed', handleStatusUpdate);
      socket.off('order:ready', handleStatusUpdate);
      socket.off('delivery:assigned', handleDeliveryAssigned);
      socket.off('delivery:location-updated', handleLocationUpdate);
    };
  }, [id, socket, order?.deliveryPartnerId, joinOrderRoom, leaveOrderRoom]);

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      const updated = await orderService.cancelOrder(order.id, cancelReason);
      setOrder(updated);
      setIsCancelModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  if (isLoading || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Connecting to live tracking satellite...</p>
      </div>
    );
  }

  let parsedAddress: any = {
    streetAddress: 'Residency Road, Bangalore',
    latitude: 12.9698,
    longitude: 77.6033,
  };
  try {
    parsedAddress = JSON.parse(order.deliveryAddressSnapshot);
  } catch {
    // Fallback coordinates
  }

  const canCancel = order.status === 'PENDING' || order.status === 'RESTAURANT_ACCEPTED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> My Orders History
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Live Order #{order.orderNumber}
            </h1>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.status === 'DELIVERED' && !order.review && (
            <Button
              onClick={() => setIsReviewModalOpen(true)}
              variant="primary"
              size="sm"
              icon={<Star className="w-4 h-4 fill-white" />}
            >
              Rate Order
            </Button>
          )}

          {canCancel && (
            <Button
              onClick={() => setIsCancelModalOpen(true)}
              variant="outline"
              size="sm"
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Live Map + Telemetry Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Keyless GPS Map & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <KeylessMap
            restaurantLocation={{
              latitude: order.restaurant.latitude,
              longitude: order.restaurant.longitude,
            }}
            restaurantName={order.restaurant.name}
            customerLocation={{
              latitude: parsedAddress.latitude || 12.9698,
              longitude: parsedAddress.longitude || 77.6033,
            }}
            customerAddress={parsedAddress.streetAddress}
            driverLocation={driverLocation}
            driverName={order.deliveryPartner?.user?.name || 'Assigned Courier'}
            orderStatus={order.status}
            height="460px"
          />

          <OrderTimeline currentStatus={order.status} statusHistory={order.statusHistory} />
        </div>

        {/* Right Col: Driver Details & Order Receipt Card */}
        <div className="space-y-6">
          {/* Assigned Driver Card */}
          {order.deliveryPartner ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Your Delivery Courier
                    </h3>
                    <h4 className="text-sm font-bold text-slate-900">
                      {order.deliveryPartner.user?.name}
                    </h4>
                  </div>
                </div>

                <span className="bg-sky-50 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                  {order.deliveryPartner.vehicleType}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{order.deliveryPartner.rating.toFixed(1)} Rating</span>
                </div>
                <span className="text-slate-500">
                  {order.deliveryPartner.totalDeliveries}+ deliveries
                </span>
              </div>

              {/* Call Driver Button */}
              {order.deliveryPartner.user?.phone && (
                <a
                  href={`tel:${order.deliveryPartner.user.phone}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4" /> Call Driver ({order.deliveryPartner.user.phone})
                </a>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                <Bike className="w-5 h-5 animate-pulse" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Assigning Courier Partner</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Once the kitchen packs your meal, our dispatch engine will match the nearest courier.
              </p>
            </div>
          )}

          {/* Restaurant & Destination Details */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 text-xs">
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Store className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">{order.restaurant.name}</span>
                  <span className="text-slate-500">{order.restaurant.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Deliver to {parsedAddress.label || 'Home'}</span>
                  <span className="text-slate-500">{parsedAddress.streetAddress}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h4 className="font-bold text-slate-800">Items Ordered</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-slate-600">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Paid */}
            <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-slate-900">
              <span>Total Paid ({order.paymentMethod.replace(/_/g, ' ')})</span>
              <span className="text-brand-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel This Order?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p>
              Are you sure you wish to cancel order #{order.orderNumber}? Any prepaid amount will be
              automatically refunded.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Cancellation Reason
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Changed my mind, ordered by mistake..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" onClick={() => setIsCancelModalOpen(false)} variant="outline" size="sm">
              Keep Order
            </Button>
            <Button type="button" onClick={handleCancelOrder} variant="danger" size="sm">
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        order={order}
        onReviewSubmitted={(review: RestaurantReview) => {
          setOrder((prev) => (prev ? { ...prev, review } : null));
        }}
      />
    </div>
  );
};
