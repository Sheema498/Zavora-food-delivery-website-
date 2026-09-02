import React, { useState } from 'react';
import { adminService } from '../services/adminService.js';
import { Role } from '../types/index.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { Bell, Send } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [broadcastTitle, setBroadcastTitle] = useState<string>('');
  const [broadcastMsg, setBroadcastMsg] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('ALL');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;

    try {
      setIsSending(true);
      setSuccessMsg(null);
      const role = targetRole !== 'ALL' ? (targetRole as Role) : undefined;
      const res = await adminService.broadcastNotification({
        title: broadcastTitle.trim(),
        message: broadcastMsg.trim(),
        targetRole: role,
      });

      setSuccessMsg(`Broadcast successfully delivered to ${res.count} active accounts!`);
      setBroadcastTitle('');
      setBroadcastMsg('');
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch broadcast');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Platform Settings & Notifications</h1>
        <p className="text-xs text-slate-500">
          Global financial parameters and in-app system-wide broadcast dispatcher
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl">
          {successMsg}
        </div>
      )}

      {/* Broadcast Dispatcher */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">In-App Broadcast Notification</h3>
            <p className="text-xs text-slate-500">
              Send real-time instant alerts and promotions directly to user notification inboxes
            </p>
          </div>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Audience
            </label>
            <div className="flex flex-wrap gap-2">
              {['ALL', 'CUSTOMER', 'RESTAURANT', 'DELIVERY_PARTNER'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTargetRole(r)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    targetRole === r
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {r === 'ALL' ? 'All Active Accounts' : r.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Announcement Title"
            placeholder="e.g. Weekend Flash Sale! 50% OFF with code QUICK50"
            value={broadcastTitle}
            onChange={(e) => setBroadcastTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Message Body
            </label>
            <textarea
              rows={3}
              placeholder="Type announcement message details..."
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSending}
              icon={<Send className="w-4 h-4" />}
              className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
            >
              Dispatch In-App Broadcast
            </Button>
          </div>
        </form>
      </div>

      {/* Platform Parameters Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Platform Economic Rules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Platform Commission</span>
            <span className="text-xl font-black text-purple-700 block">15.0%</span>
            <p className="text-[11px] text-slate-400 mt-1">Deducted from restaurant order totals</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Government Tax (GST)</span>
            <span className="text-xl font-black text-slate-900 block">5.0%</span>
            <p className="text-[11px] text-slate-400 mt-1">Calculated on item subtotal</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Base Delivery Fee</span>
            <span className="text-xl font-black text-brand-600 block">₹40.00</span>
            <p className="text-[11px] text-slate-400 mt-1">Free delivery for orders ₹500+</p>
          </div>
        </div>
      </div>
    </div>
  );
};
