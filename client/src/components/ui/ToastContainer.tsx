import React from 'react';
import { useNotifications } from '../../context/NotificationContext.js';
import { Bell, X, CheckCircle, AlertCircle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900 text-white rounded-xl shadow-2xl p-4 border border-slate-800 flex items-start gap-3 transform transition-all duration-200 animate-in slide-in-from-top-4"
        >
          <div className="p-1.5 bg-brand-500/20 text-brand-400 rounded-lg shrink-0 mt-0.5">
            {toast.type === 'ORDER_STATUS' ? (
              <CheckCircle className="w-4 h-4" />
            ) : toast.type === 'DELIVERY_ASSIGNED' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white leading-tight">{toast.title}</h4>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
