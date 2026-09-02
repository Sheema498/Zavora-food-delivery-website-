import React, { useState, useEffect } from 'react';
import { Order } from '../../types/index.js';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { deliveryService } from '../../services/deliveryService.js';
import { Bike, Star, Navigation, CheckCircle2, User } from 'lucide-react';

export interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onDriverAssigned: () => void;
}

export const AssignDriverModal: React.FC<AssignDriverModalProps> = ({
  isOpen,
  onClose,
  order,
  onDriverAssigned,
}) => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchDrivers = async () => {
        try {
          setIsLoading(true);
          const data = await deliveryService.getAvailableDrivers(
            order.restaurant.latitude,
            order.restaurant.longitude
          );
          setDrivers(data);
          if (data.length > 0) {
            setSelectedDriverId(data[0].id);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to fetch available drivers');
        } finally {
          setIsLoading(false);
        }
      };
      fetchDrivers();
    }
  }, [isOpen, order]);

  const handleAssign = async () => {
    if (!selectedDriverId) return;

    try {
      setIsAssigning(true);
      setError(null);
      await deliveryService.assignDriver(order.id, selectedDriverId);
      onDriverAssigned();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign driver');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Delivery Partner — Order #${order.orderNumber}`}
      description={`Restaurant: ${order.restaurant.name} | Total: ₹${order.totalAmount}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && <p className="text-xs text-rose-500 bg-rose-50 p-2.5 rounded-xl">{error}</p>}

        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Available Online Delivery Partners ({drivers.length})
        </p>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Finding nearby available couriers...
          </div>
        ) : drivers.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
            No online delivery partners currently available.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                onClick={() => setSelectedDriverId(driver.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedDriverId === driver.id
                    ? 'bg-brand-50/70 border-brand-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0">
                    <Bike className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{driver.name}</h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        Online
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {driver.rating.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span>{driver.vehicleType}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-700">{driver.distanceToRestaurantKm} km away</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {selectedDriverId === driver.id ? (
                    <CheckCircle2 className="w-5 h-5 text-brand-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            variant="primary"
            size="sm"
            disabled={!selectedDriverId || drivers.length === 0}
            isLoading={isAssigning}
          >
            Dispatch & Notify Courier
          </Button>
        </div>
      </div>
    </Modal>
  );
};
