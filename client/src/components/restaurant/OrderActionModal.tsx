import React, { useState } from 'react';
import { Order } from '../../types/index.js';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Clock, AlertCircle } from 'lucide-react';

export interface OrderActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  actionType: 'ACCEPT' | 'REJECT';
  onActionConfirmed: (options: { estimatedPrepMinutes?: number; rejectionReason?: string }) => void;
}

const REJECTION_REASONS = [
  'Kitchen is currently at maximum cooking capacity',
  'One or more ordered ingredients are out of stock',
  'Restaurant closing soon for the day',
  'Special instructions cannot be accommodated',
  'Delivery radius too far for current weather',
];

export const OrderActionModal: React.FC<OrderActionModalProps> = ({
  isOpen,
  onClose,
  order,
  actionType,
  onActionConfirmed,
}) => {
  const [prepTime, setPrepTime] = useState<number>(order.estimatedPrepMinutes || 20);
  const [selectedReason, setSelectedReason] = useState<string>(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');

  const isAccept = actionType === 'ACCEPT';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAccept) {
      onActionConfirmed({ estimatedPrepMinutes: prepTime });
    } else {
      const reason = customReason.trim() || selectedReason;
      onActionConfirmed({ rejectionReason: reason });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAccept ? `Accept Order #${order.orderNumber}` : `Decline Order #${order.orderNumber}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isAccept ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-blue-900 text-xs">
              <p className="font-semibold">Confirm Kitchen Preparation Time</p>
              <p className="text-blue-700 mt-1">
                The customer will see this estimated preparation countdown in their live tracking view.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span>Estimated Prep Duration</span>
                <span className="text-brand-600 text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {prepTime} minutes
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>10 mins</span>
                <span>30 mins</span>
                <span>60 mins</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>Declining this order will notify the customer and automatically issue a full refund.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Select Reason for Declining:
              </label>
              {REJECTION_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedReason === r
                      ? 'bg-rose-50/60 border-rose-400 text-rose-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Other Specific Note (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Type additional explanation..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isAccept ? 'primary' : 'danger'}
            size="sm"
          >
            {isAccept ? 'Accept & Start Cooking' : 'Confirm Decline'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
