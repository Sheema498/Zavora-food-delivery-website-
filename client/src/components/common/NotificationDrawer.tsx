import React from 'react';
import { useNotifications } from '../../context/NotificationContext.js';
import { X, CheckCheck, Bell, ShoppingBag, Bike, ShieldAlert } from 'lucide-react';
import { formatTimeAgo } from '../../utils/formatters.js';

export const NotificationDrawer: React.FC = () => {
  const { notifications, unreadCount, isDrawerOpen, closeDrawer, markAsRead, markAllAsRead } =
    useNotifications();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-100 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">In-App Notifications</h3>
                <p className="text-xs text-slate-500">{unreadCount} unread updates</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors cursor-pointer"
                  title="Mark all read"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={closeDrawer}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Bell className="w-10 h-10 mx-auto stroke-[1.5] mb-2 text-slate-300" />
                <p className="text-sm font-semibold">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">Live order updates will show up here</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={`py-3.5 px-3 rounded-xl transition-colors cursor-pointer flex items-start gap-3 ${
                    n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-brand-50/40 hover:bg-brand-50/70 border border-brand-100'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      n.type === 'ORDER_STATUS'
                        ? 'bg-blue-100 text-blue-600'
                        : n.type === 'DELIVERY_ASSIGNED'
                        ? 'bg-teal-100 text-teal-600'
                        : 'bg-brand-100 text-brand-600'
                    }`}
                  >
                    {n.type === 'ORDER_STATUS' ? (
                      <ShoppingBag className="w-4 h-4" />
                    ) : n.type === 'DELIVERY_ASSIGNED' ? (
                      <Bike className="w-4 h-4" />
                    ) : (
                      <ShieldAlert className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>

                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
