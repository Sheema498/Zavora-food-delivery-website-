import React from 'react';
import { useNotifications } from '../context/NotificationContext.js';
import { Button } from '../components/ui/Button.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { Bell, CheckCheck, ShoppingBag, Bike, ShieldAlert } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters.js';

export const Notifications: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Notifications</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time updates regarding order preparation, courier dispatch, and platform alerts
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
            icon={<CheckCheck className="w-4 h-4" />}
          >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="No notifications"
          description="You're all caught up! Order status transitions and delivery dispatch alerts will show up here."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={`p-4 transition-colors cursor-pointer flex items-start gap-4 ${
                n.isRead ? 'hover:bg-slate-50' : 'bg-brand-50/30 hover:bg-brand-50/60'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  n.type === 'ORDER_STATUS'
                    ? 'bg-blue-100 text-blue-600'
                    : n.type === 'DELIVERY_ASSIGNED'
                    ? 'bg-teal-100 text-teal-600'
                    : 'bg-brand-100 text-brand-600'
                }`}
              >
                {n.type === 'ORDER_STATUS' ? (
                  <ShoppingBag className="w-5 h-5" />
                ) : n.type === 'DELIVERY_ASSIGNED' ? (
                  <Bike className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                  <span className="text-xs text-slate-400 shrink-0">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
