import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService.js';
import { Address } from '../types/index.js';
import { AddressModal } from '../components/customer/AddressModal.js';
import { Button } from '../components/ui/Button.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';

export const Addresses: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you wish to delete this address?')) return;
    try {
      await userService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Saved Addresses</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your delivery locations for faster 1-click checkout
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingAddress(null);
            setIsModalOpen(true);
          }}
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Address
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-8 h-8" />}
          title="No saved addresses yet"
          description="Add your home, office, or apartment address to get food delivered with pinpoint accuracy."
          actionText="Add Delivery Address"
          onAction={() => {
            setEditingAddress(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-card transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-brand-200 uppercase tracking-wider">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingAddress(addr);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2">
                  {addr.recipientName || 'Recipient'} ({addr.phone || 'No phone'})
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{addr.streetAddress}</p>
                {addr.landmark && (
                  <p className="text-[11px] text-slate-400 mt-0.5">Landmark: {addr.landmark}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {addr.city}, {addr.state} - {addr.postalCode}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialAddress={editingAddress}
        onAddressSaved={() => fetchAddresses()}
      />
    </div>
  );
};
