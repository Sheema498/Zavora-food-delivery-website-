import React, { useState } from 'react';
import { Address } from '../../types/index.js';
import { Modal } from '../ui/Modal.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { userService } from '../../services/userService.js';

export interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSaved: (address: Address) => void;
  initialAddress?: Address | null;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onAddressSaved,
  initialAddress,
}) => {
  const [label, setLabel] = useState<string>(initialAddress?.label || 'Home');
  const [recipientName, setRecipientName] = useState<string>(initialAddress?.recipientName || '');
  const [phone, setPhone] = useState<string>(initialAddress?.phone || '');
  const [streetAddress, setStreetAddress] = useState<string>(initialAddress?.streetAddress || '');
  const [landmark, setLandmark] = useState<string>(initialAddress?.landmark || '');
  const [city, setCity] = useState<string>(initialAddress?.city || 'Bengaluru');
  const [state, setState] = useState<string>(initialAddress?.state || 'Karnataka');
  const [postalCode, setPostalCode] = useState<string>(initialAddress?.postalCode || '560001');
  const [isDefault, setIsDefault] = useState<boolean>(initialAddress?.isDefault || false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetAddress.trim() || !postalCode.trim()) {
      setError('Please fill in complete street address and postal code');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      let saved: Address;
      if (initialAddress) {
        saved = await userService.updateAddress(initialAddress.id, {
          label,
          recipientName,
          phone,
          streetAddress,
          landmark,
          city,
          state,
          postalCode,
          isDefault,
        });
      } else {
        saved = await userService.addAddress({
          label,
          recipientName,
          phone,
          streetAddress,
          landmark,
          city,
          state,
          postalCode,
          isDefault,
          latitude: 12.9716 + (Math.random() - 0.5) * 0.015,
          longitude: 77.5946 + (Math.random() - 0.5) * 0.015,
        });
      }

      onAddressSaved(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-xs text-rose-500 bg-rose-50 p-2.5 rounded-xl">{error}</p>}

        <div className="flex gap-2">
          {['Home', 'Work', 'Other'].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLabel(l)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                label === l
                  ? 'bg-brand-50 border-brand-500 text-brand-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Recipient Name"
            placeholder="e.g. Alex Johnson"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />
          <Input
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <Input
          label="Street Address / Flat / Floor"
          placeholder="e.g. Flat 402, Prestige Towers, Residency Road"
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          required
        />

        <Input
          label="Landmark (Optional)"
          placeholder="e.g. Near Bishop Cotton School"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-3">
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
          <Input label="State" value={state} onChange={(e) => setState(e.target.value)} required />
          <Input
            label="PIN / Postal Code"
            placeholder="560025"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="rounded text-brand-500 focus:ring-brand-400"
          />
          <span className="text-xs font-medium text-slate-700">Set as default delivery address</span>
        </label>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Save Address
          </Button>
        </div>
      </form>
    </Modal>
  );
};
