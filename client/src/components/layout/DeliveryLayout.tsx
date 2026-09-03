import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useSocket } from '../../context/SocketContext.js';
import { deliveryService } from '../../services/deliveryService.js';
import {
  Bike,
  Navigation,
  History,
  DollarSign,
  Power,
  LogOut,
  Bell,
  User,
  CheckCircle2,
} from 'lucide-react';
import { NotificationDrawer } from '../common/NotificationDrawer.js';
import { useNotifications } from '../../context/NotificationContext.js';

export const DeliveryLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const { unreadCount, openDrawer } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  const handleToggleOnline = async () => {
    try {
      setIsToggling(true);
      const nextState = !isOnline;
      await deliveryService.toggleOnlineStatus(nextState);
      setIsOnline(nextState);
      if (socket) {
        socket.emit('driver:status-toggle', {
          deliveryBoyId: user?.deliveryBoyId || user?.deliveryPartnerId,
          isOnline: nextState,
        });
      }
    } catch (err) {
      console.error('Failed to toggle driver online status:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navTabs = [
    { label: 'Active Delivery', path: '/delivery/dashboard', icon: Navigation },
    { label: 'History', path: '/delivery/history', icon: History },
    { label: 'Earnings', path: '/delivery/earnings', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-20 sm:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white h-16 flex items-center justify-between px-4 sm:px-6 shadow-md">
        <div className="flex items-center gap-3">
          <Link to="/delivery/dashboard" className="flex items-center gap-2.5">
            <img
              src="/zavora-logo.png"
              alt="Zavora"
              className="h-8 w-auto object-contain brightness-110"
            />
            <div>
              <span className="text-xs font-black tracking-tight text-white block">
                ZAVORA COURIER
              </span>
              <span className="text-[10px] text-teal-400 font-bold block">
                Dedicated Delivery Portal
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Online/Offline Toggle */}
          <button
            onClick={handleToggleOnline}
            disabled={isToggling}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              isOnline
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>

          {/* Notifications */}
          <button
            onClick={openDrawer}
            className="relative p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-teal-400 text-slate-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Courier Info */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="text-right text-xs">
              <p className="font-bold text-white leading-tight">{user?.name || 'Courier'}</p>
              <p className="text-[10px] text-teal-400">KA-01-ZV-1001</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Desktop Subnav */}
      <div className="hidden sm:flex bg-white border-b border-slate-200 px-6 py-2 gap-4">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Content Area */}
      <main className="flex-1 p-3 sm:p-6 max-w-4xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 shadow-lg">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center gap-1 w-full py-1 text-[10px] font-bold ${
                isActive ? 'text-teal-600' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <NotificationDrawer />
    </div>
  );
};
