import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  ShoppingBag,
  Clock,
  Menu as MenuIcon,
  X,
  Power,
  ChevronRight,
} from 'lucide-react';
import { NotificationDrawer } from '../common/NotificationDrawer.js';
import { useNotifications } from '../../context/NotificationContext.js';

export const ManagerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount, openDrawer } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isKitchenOpen, setIsKitchenOpen] = useState<boolean>(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Kitchen Console', path: '/manager/dashboard', icon: LayoutDashboard },
    { label: 'Live Orders', path: '/manager/orders', icon: ShoppingBag },
    { label: 'Food Items', path: '/manager/menu', icon: UtensilsCrossed },
    { label: 'Categories', path: '/manager/categories', icon: FolderTree },
    { label: 'Kitchen Earnings', path: '/manager/earnings', icon: DollarSign },
    { label: 'Notifications', path: '/manager/notifications', icon: Bell },
    { label: 'Restaurant Settings', path: '/manager/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>

          <Link to="/manager/dashboard" className="flex items-center gap-3">
            <img
              src="/zavora-logo.png"
              alt="Zavora"
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <span className="text-sm font-black text-slate-900 block leading-tight">
                ZAVORA KITCHEN
              </span>
              <span className="text-[10px] font-bold text-orange-600 block uppercase tracking-wider">
                Restaurant Manager Portal
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Kitchen Online/Offline Toggle */}
          <button
            onClick={() => setIsKitchenOpen(!isKitchenOpen)}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              isKitchenOpen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Kitchen is {isKitchenOpen ? 'OPEN' : 'CLOSED'}</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={openDrawer}
            className="relative p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Manager Info */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              M
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'Manager'}</p>
              <p className="text-[10px] text-slate-400">Head Chef & Mgr</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 pt-16 md:pt-0 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Kitchen Operations
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </div>

          {/* Kitchen Summary Badge */}
          <div className="p-4 mt-8 mx-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
            <p className="font-bold text-slate-800">Zavora Restaurant</p>
            <p className="text-[11px] text-slate-500">88 Brigade Rd, Bengaluru</p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Dedicated Delivery Boy On Duty</span>
            </div>
          </div>
        </aside>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <NotificationDrawer />
    </div>
  );
};
