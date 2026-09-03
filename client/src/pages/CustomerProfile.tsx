import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { authService } from '../services/authService.js';
import { Award } from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState<string>(user?.name || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setSuccessMsg(null);
      const updated = await authService.updateProfile({ name, phone, avatarUrl });
      updateUser(updated);
      setSuccessMsg('Profile updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Your Account Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal details and loyalty status
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <img
              src={
                avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'User'
                )}&background=f97316&color=fff`
              }
              alt={user?.name}
              className="w-full h-full rounded-2xl object-cover shadow-md"
            />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-2 bg-brand-50 text-brand-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-brand-200">
              {user?.role}
            </span>
          </div>

          {/* Loyalty Banner */}
          <div className="bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-200 p-3.5 rounded-xl text-left space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <Award className="w-4 h-4 text-amber-600" /> Zavora Gourmet Club
            </div>
            <p className="text-[11px] text-amber-700">
              You have <strong className="font-black">120 Loyalty Points</strong> available for order discounts.
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            Personal Information
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Email is linked to your account identity and cannot be changed.
              </p>
            </div>

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              label="Avatar Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
