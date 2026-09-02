import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { deliveryService } from '../services/deliveryService.js';
import { useSocket } from '../context/SocketContext.js';
import { Order, LatLng } from '../types/index.js';
import { KeylessMap } from '../components/common/KeylessMap.js';
import { OrderTimeline } from '../components/common/OrderTimeline.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Button } from '../components/ui/Button.js';
import { LocationSimulator } from '../components/delivery/LocationSimulator.js';
import { formatCurrency } from '../utils/formatters.js';
import {
  Bike,
  Store,
  MapPin,
  CheckCircle2,
  Navigation,
  ArrowLeft,
} from 'lucide-react';

export const DeliveryActive: React.FC = () => {
  const { user } = useAuth();
  const { socket, joinOrderRoom, leaveOrderRoom } = useSocket();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchActiveDelivery = async () => {
    try {
      setIsLoading(true);
      const data = await deliveryService.getActiveDelivery();
      setOrder(data);
      if (data && user?.deliveryPartnerId) {
        setDriverLocation({
          latitude: data.restaurant.latitude,
          longitude: data.restaurant.longitude,
        });
      }
    } catch (err) {
      console.error('Failed to load active delivery:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDelivery();
  }, []);

  // Room subscription
  useEffect(() => {
    if (!order?.id || !socket) return;
    joinOrderRoom(order.id);

    const handleStatusChanged = (data: any) => {
      if (data.orderId === order.id) {
        fetchActiveDelivery();
      }
    };

    socket.on('order:status-changed', handleStatusChanged);

    return () => {
      leaveOrderRoom(order.id);
      socket.off('order:status-changed', handleStatusChanged);
    };
  }, [order?.id, socket, joinOrderRoom, leaveOrderRoom]);

  const handleStepAction = async (action: 'ARRIVED' | 'PICKUP' | 'START' | 'COMPLETE') => {
    if (!order) return;
    try {
      setIsUpdating(true);
      if (action === 'ARRIVED') {
        await deliveryService.markArrived(order.id);
      } else if (action === 'PICKUP') {
        await deliveryService.markPickedUp(order.id);
      } else if (action === 'START') {
        await deliveryService.startDelivery(order.id);
      } else if (action === 'COMPLETE') {
        await deliveryService.completeDelivery(order.id);
        alert('🎉 Delivery completed successfully! Payout credited to your shift earnings.');
        navigate('/delivery/dashboard');
        return;
      }
      fetchActiveDelivery();
    } catch (err: any) {
      alert(err.message || 'Failed to update delivery milestone');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading active delivery status...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <Bike className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No Active Delivery Trip</h2>
        <p className="text-xs text-slate-500">
          You currently have no active assigned delivery in progress.
        </p>
        <Link to="/delivery/dashboard">
          <Button variant="primary" size="sm">
            Back to Dashboard
          </Button>
        </Link>
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
    // Fallback
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <Link
            to="/delivery/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Driver Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Active Delivery Trip — #{order.orderNumber}
            </h1>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-black text-emerald-600">
            Trip Pay: {formatCurrency(order.deliveryFee + order.tipAmount + 45.0)}
          </span>
          <span className="text-[10px] text-slate-400 block">Base + Distance + Tip</span>
        </div>
      </div>

      {/* Main Grid: Map + Turn-by-Turn Action Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Map & Location Simulator */}
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
            driverName={user?.name || 'You (Driver)'}
            orderStatus={order.status}
            height="440px"
          />

          {/* Real-Time GPS Broadcaster Simulator */}
          {user?.deliveryPartnerId && (
            <LocationSimulator
              orderId={order.id}
              deliveryPartnerId={user.deliveryPartnerId}
              origin={{
                latitude: order.restaurant.latitude,
                longitude: order.restaurant.longitude,
              }}
              destination={{
                latitude: parsedAddress.latitude || 12.9698,
                longitude: parsedAddress.longitude || 77.6033,
              }}
              onLocationUpdate={(coord) => {
                setDriverLocation(coord);
              }}
            />
          )}

          <OrderTimeline currentStatus={order.status} statusHistory={order.statusHistory} />
        </div>

        {/* Right Col: Courier Milestone Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Delivery Action Workflow
            </h3>

            {/* Workflow Step 1: Arrived at Restaurant */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                order.status === 'DELIVERY_ACCEPTED'
                  ? 'bg-brand-50 border-brand-500 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  Step 1: Restaurant Pickup
                </span>
                <Store className="w-4 h-4 text-brand-600" />
              </div>
              <p className="text-xs text-slate-700 font-semibold">{order.restaurant.name}</p>
              <p className="text-[11px] text-slate-500">{order.restaurant.address}</p>

              {order.status === 'DELIVERY_ACCEPTED' && (
                <Button
                  onClick={() => handleStepAction('ARRIVED')}
                  variant="primary"
                  size="sm"
                  className="w-full mt-2"
                  isLoading={isUpdating}
                >
                  Mark Arrived at Restaurant
                </Button>
              )}
            </div>

            {/* Workflow Step 2: Food Picked Up */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                order.status === 'ARRIVED_AT_RESTAURANT'
                  ? 'bg-blue-50 border-blue-500 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Step 2: Collect Food Box
                </span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-slate-700">
                Verify {order.items.length} items with the chef
              </p>

              {order.status === 'ARRIVED_AT_RESTAURANT' && (
                <Button
                  onClick={() => handleStepAction('PICKUP')}
                  variant="primary"
                  size="sm"
                  className="w-full mt-2"
                  isLoading={isUpdating}
                >
                  Confirm Food Picked Up
                </Button>
              )}
            </div>

            {/* Workflow Step 3: Start Delivery (On The Way) */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                order.status === 'PICKED_UP'
                  ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Step 3: Out for Delivery
                </span>
                <Navigation className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xs text-slate-700">Start live route navigation towards customer</p>

              {order.status === 'PICKED_UP' && (
                <Button
                  onClick={() => handleStepAction('START')}
                  variant="primary"
                  size="sm"
                  className="w-full mt-2"
                  isLoading={isUpdating}
                >
                  Start Delivery (On The Way) 🛵
                </Button>
              )}
            </div>

            {/* Workflow Step 4: Mark Delivered */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                order.status === 'ON_THE_WAY'
                  ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Step 4: Customer Doorstep
                </span>
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-700 font-semibold">{parsedAddress.recipientName}</p>
              <p className="text-[11px] text-slate-500">{parsedAddress.streetAddress}</p>

              {order.status === 'ON_THE_WAY' && (
                <Button
                  onClick={() => handleStepAction('COMPLETE')}
                  variant="success"
                  size="sm"
                  className="w-full mt-2"
                  isLoading={isUpdating}
                >
                  Mark Order as Delivered 🎉
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
