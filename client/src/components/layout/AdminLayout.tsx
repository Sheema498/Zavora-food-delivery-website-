import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  ShieldCheck,
  BarChart3,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Bell,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { NotificationDrawer } from '../common/NotificationDrawer.js';
import { useNotifications } from '../../context/NotificationContext.js';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount, openDrawer } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Business Analytics', path: '/admin/dashboard', icon: BarChart3 },
    { label: 'Order Inspection', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Menu & Dishes', path: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Customers & Staff', path: '/admin/customers', icon: Users },
    { label: 'System Broadcasts', path: '/admin/notifications', icon: Bell },
    { label: 'Audit Trail', path: '/admin/audit-logs', icon: FileText },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white h-16 flex items-center justify-between px-4 sm:px-6 shadow-md border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-800 cursor-pointer"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <img
              src="/zavora-logo.png"
              alt="Zavora"
              className="h-9 w-auto object-contain brightness-110"
            />
            <div>
              <span className="text-sm font-black tracking-tight text-white block">
                ZAVORA SUPER ADMIN
              </span>
              <span className="text-[10px] text-purple-400 font-bold block uppercase tracking-wider">
                Control & Oversight Center
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Super Admin Badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Full System Access</span>
          </div>

          {/* Notifications */}
          <button
            onClick={openDrawer}
            className="relative p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="hidden sm:block text-right text-xs pl-2 border-l border-slate-800">
            <p className="font-bold text-white leading-tight">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-slate-400">admin@zavora.com</p>
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

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 pt-16 md:pt-0 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Management
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
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
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

          {/* Privacy Note */}
          <div className="p-4 mt-8 mx-3 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-1 text-xs">
            <p className="font-bold text-purple-900">GPS Privacy Enforced</p>
            <p className="text-[11px] text-purple-700 leading-relaxed">
              In accordance with privacy rules, live GPS telemetry is restricted exclusively to the Customer and Delivery Boy.
            </p>
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
