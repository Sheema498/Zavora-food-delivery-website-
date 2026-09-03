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
  Phone,
  Package,
} from 'lucide-react';

export const DeliveryActive: React.FC = () => {
  const { user } = useAuth();
  const { socket, joinOrderRoom, leaveOrderRoom } = useSocket();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const driverId = user?.deliveryBoyId || user?.deliveryPartnerId;

  const fetchActiveDelivery = async () => {
    try {
      setIsLoading(true);
      const data = await deliveryService.getActiveDelivery();
      setOrder(data);
      if (data) {
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

  const handleStepAction = async (action: 'ACCEPT' | 'ARRIVED' | 'PICKUP' | 'START' | 'COMPLETE') => {
    if (!order) return;
    try {
      setIsUpdating(true);
      if (action === 'ACCEPT') {
        await deliveryService.acceptAssignment(order.id);
      } else if (action === 'ARRIVED') {
        await deliveryService.markArrived(order.id);
      } else if (action === 'PICKUP') {
        await deliveryService.markPickedUp(order.id);
      } else if (action === 'START') {
        await deliveryService.startDelivery(order.id);
      } else if (action === 'COMPLETE') {
        await deliveryService.completeDelivery(order.id);
        alert('🎉 Delivery completed successfully! ₹45 credited to your earnings.');
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
        Loading active delivery mission...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <Bike className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No Active Delivery Mission</h2>
        <p className="text-xs text-slate-500">
          You currently have no active assigned order in progress.
        </p>
        <Link to="/delivery/dashboard">
          <Button variant="primary" size="sm" className="bg-teal-600 hover:bg-teal-700">
            Back to Courier Console
          </Button>
        </Link>
      </div>
    );
  }

  let parsedAddress: any = {
    streetAddress: 'Residency Road, Bangalore',
    recipientName: 'Customer',
    phone: '+91 98765 43210',
    latitude: 12.9698,
    longitude: 77.6033,
  };
  try {
    parsedAddress = JSON.parse(order.deliveryAddressSnapshot);
  } catch {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <Link
            to="/delivery/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Courier Console
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Delivery Mission — #{order.orderNumber}
            </h1>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-black text-emerald-600">
            Trip Pay: ₹45.00
          </span>
          <span className="text-[10px] text-slate-400 block">Credited upon completion</span>
        </div>
      </div>

      {/* Main Grid: Live Map + Milestone Actions */}
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
            driverName={user?.name || 'Kiran (You)'}
            orderStatus={order.status}
            height="440px"
          />

          {/* Real-Time GPS Broadcaster Simulator */}
          {driverId && (
            <LocationSimulator
              orderId={order.id}
              deliveryPartnerId={driverId}
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
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Delivery Milestones
            </h3>

            {/* Step 0: Accept (if newly assigned) */}
            {order.status === 'DELIVERY_ASSIGNED' && (
              <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-300 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-800">
                  Step 0: Accept Assignment
                </span>
                <p className="text-xs text-cyan-900">
                  Zavora kitchen has packed this order and assigned it to you.
                </p>
                <Button
                  onClick={() => handleStepAction('ACCEPT')}
                  variant="primary"
                  size="sm"
                  className="w-full bg-cyan-600 hover:bg-cyan-700 font-bold"
                  isLoading={isUpdating}
                >
                  Accept Delivery Mission 🛵
                </Button>
              </div>
            )}

            {/* Step 1: Restaurant Pickup */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                order.status === 'DELIVERY_ACCEPTED'
                  ? 'bg-amber-50 border-amber-400 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Step 1: Arrive at Zavora
                </span>
                <Store className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs text-slate-800 font-bold">{order.restaurant.name}</p>
              <p className="text-[11px] text-slate-500">{order.restaurant.address}</p>

              {order.status === 'DELIVERY_ACCEPTED' && (
                <Button
                  onClick={() => handleStepAction('ARRIVED')}
                  variant="primary"
                  size="sm"
                  className="w-full mt-2 bg-amber-600 hover:bg-amber-700 font-bold"
                  isLoading={isUpdating}
                >
                  Mark Arrived at Zavora 📍
                </Button>
              )}
            </div>

            {/* Step 2: Food Picked Up */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                order.status === 'ARRIVED_AT_RESTAURANT'
                  ? 'bg-blue-50 border-blue-400 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Step 2: Collect Thermal Food Bag
                </span>
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-slate-700">
                Verify {order.items.length} dishes with kitchen chef
              </p>

              {order.status === 'ARRIVED_AT_RESTAURANT' && (
                <Button
                  onClick={() => handleStepAction('PICKUP')}
                  variant="primary"
                  size="sm"
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 font-bold"
                  isLoading={isUpdating}
                >
                  Confirm Food Picked Up 🛍️
                </Button>
              )}
            </div>

            {/* Step 3: Out for Delivery */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                order.status === 'PICKED_UP'
                  ? 'bg-orange-50 border-orange-400 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
                  Step 3: En Route to Customer
                </span>
                <Navigation className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-xs text-slate-700">Live GPS broadcaster activates automatically</p>

              {order.status === 'PICKED_UP' && (
                <Button
                  onClick={() => handleStepAction('START')}
                  variant="primary"
                  size="sm"
                  className="w-full mt-2 bg-orange-500 hover:bg-orange-600 font-bold"
                  isLoading={isUpdating}
                >
                  Start Delivery (On The Way) 🚀
                </Button>
              )}
            </div>

            {/* Step 4: Mark Delivered */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                order.status === 'ON_THE_WAY'
                  ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Step 4: Hand Over at Doorstep
                </span>
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-800 font-bold">
                {parsedAddress.recipientName || order.customer?.name}
              </p>
              <p className="text-[11px] text-slate-500">{parsedAddress.streetAddress}</p>
              <p className="text-xs text-teal-700 font-semibold flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span>{parsedAddress.phone || order.customer?.phone}</span>
              </p>

              {order.status === 'ON_THE_WAY' && (
                <Button
                  onClick={() => handleStepAction('COMPLETE')}
                  variant="success"
                  size="sm"
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 font-bold"
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
