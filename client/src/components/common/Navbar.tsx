import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { DEMO_CREDENTIALS } from '../../constants/index.js';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Bike,
  ShieldCheck,
  ChevronDown,
  Store,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { Role } from '../../types/index.js';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, quickDemoLogin } = useAuth();
  const { cart, openCartDrawer } = useCart();
  const { unreadCount, openDrawer } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isDemoBarOpen, setIsDemoBarOpen] = useState<boolean>(false);

  const handleRoleSwitch = async (role: Role) => {
    await quickDemoLogin(role);
    setIsDemoBarOpen(false);

    if (role === 'CUSTOMER') navigate('/restaurants');
    else if (role === 'RESTAURANT') navigate('/restaurant/dashboard');
    else if (role === 'DELIVERY_PARTNER') navigate('/delivery/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      {/* 1-Click Demo Roles Quick Switcher Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="flex items-center gap-1 font-bold text-brand-400 uppercase tracking-wider shrink-0">
            <Sparkles className="w-3.5 h-3.5" /> 1-Click Role Switch:
          </span>
          {DEMO_CREDENTIALS.map((demo) => (
            <button
              key={demo.role}
              onClick={() => handleRoleSwitch(demo.role)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                user?.role === demo.role
                  ? 'bg-brand-500 text-white font-bold shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {demo.badge}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px] shrink-0">
          <span>Current Role:</span>
          <span className="font-bold text-emerald-400 uppercase">{user?.role || 'Guest'}</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
              Quick<span className="text-brand-500">Bite</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block -mt-1 tracking-wider uppercase">
              Live Food Ops
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/restaurants"
            className={`text-sm font-medium transition-colors hover:text-brand-500 ${
              location.pathname === '/restaurants' ? 'text-brand-600 font-bold' : 'text-slate-600'
            }`}
          >
            Explore Food & Restaurants
          </Link>
          <Link
            to="/orders"
            className={`text-sm font-medium transition-colors hover:text-brand-500 ${
              location.pathname === '/orders' ? 'text-brand-600 font-bold' : 'text-slate-600'
            }`}
          >
            My Orders
          </Link>
          {user?.role === 'RESTAURANT' && (
            <Link
              to="/restaurant/dashboard"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" /> Kitchen Dashboard
            </Link>
          )}
          {user?.role === 'DELIVERY_PARTNER' && (
            <Link
              to="/delivery/dashboard"
              className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1.5"
            >
              <Bike className="w-4 h-4" /> Delivery Console
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin/dashboard"
              className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Admin Control
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          {isAuthenticated && (
            <button
              onClick={openDrawer}
              className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Button (For Customers) */}
          {(!user || user.role === 'CUSTOMER') && (
            <button
              onClick={openCartDrawer}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-glow transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cart && cart.itemCount > 0 && (
                <span className="bg-white text-brand-600 text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {cart.itemCount}
                </span>
              )}
            </button>
          )}

          {/* User Auth Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
              >
                <img
                  src={
                    user.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=fff`
                  }
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50"
                      >
                        <ShieldCheck className="w-4 h-4" /> Admin Center
                      </Link>
                    )}
                    {user.role === 'RESTAURANT' && (
                      <Link
                        to="/restaurant/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        <Store className="w-4 h-4" /> Restaurant Portal
                      </Link>
                    )}
                    {user.role === 'DELIVERY_PARTNER' && (
                      <Link
                        to="/delivery/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                      >
                        <Bike className="w-4 h-4" /> Delivery Portal
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <UserIcon className="w-4 h-4" /> Profile & Settings
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <ShoppingBag className="w-4 h-4" /> My Orders
                    </Link>
                    <Link
                      to="/addresses"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <MapPin className="w-4 h-4" /> Saved Addresses
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-brand-600 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
