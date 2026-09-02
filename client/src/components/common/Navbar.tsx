import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
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
  MapPin,
  Menu,
  X,
  Compass,
  Grid,
  Info,
  PhoneCall,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, openCartDrawer } = useCart();
  const { unreadCount, openDrawer } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Restaurants', path: '/restaurants' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-sm transition-all">
      {/* Main Clean Public Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/zavora-logo.png"
            alt="Zavora Logo"
            className="w-11 h-11 rounded-2xl object-cover shadow-md shadow-purple-900/20 group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
              ZAVORA
            </span>
            <span className="text-[10px] font-bold text-brand-600 block -mt-1 tracking-wider">
              Satisfy your hunger instantly
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-semibold transition-colors hover:text-brand-600 ${
                location.pathname === link.path ? 'text-brand-600 font-bold border-b-2 border-brand-500 pb-0.5' : 'text-slate-600'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Role Dashboard Link if logged in */}
          {isAuthenticated && user?.role === 'CUSTOMER' && (
            <Link
              to="/orders"
              className={`text-sm font-semibold transition-colors hover:text-brand-600 ${
                location.pathname === '/orders' ? 'text-brand-600 font-bold' : 'text-slate-600'
              }`}
            >
              My Orders
            </Link>
          )}
          {isAuthenticated && (user?.role === 'RESTAURANT' || user?.role === 'RESTAURANT_ADMIN') && (
            <Link
              to="/restaurant/dashboard"
              className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200"
            >
              <Store className="w-4 h-4" /> Kitchen Dashboard
            </Link>
          )}
          {isAuthenticated && user?.role === 'DELIVERY_PARTNER' && (
            <Link
              to="/delivery/dashboard"
              className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1.5 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200"
            >
              <Bike className="w-4 h-4" /> Delivery Console
            </Link>
          )}
          {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <Link
              to="/admin/dashboard"
              className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200"
            >
              <ShieldCheck className="w-4 h-4" /> Admin Center
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          {isAuthenticated && (
            <button
              onClick={openDrawer}
              className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-orange-50/80 rounded-2xl transition-colors cursor-pointer"
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

          {/* Cart Button (For Customers / Guests) */}
          {(!user || user.role === 'CUSTOMER') && (
            <button
              onClick={openCartDrawer}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white font-bold text-sm rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cart && cart.itemCount > 0 && (
                <span className="bg-white text-brand-600 text-xs px-2 py-0.5 rounded-full font-black shadow-xs">
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
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl hover:bg-orange-50/80 transition-colors border border-slate-200 cursor-pointer"
              >
                <img
                  src={
                    user.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=fff&bold=true`
                  }
                  alt={user.name}
                  className="w-8 h-8 rounded-xl object-cover shadow-xs"
                />
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-brand-600 font-semibold uppercase">{user.role.replace('_', ' ')}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 rounded-t-3xl">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-100 text-brand-700 uppercase">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-2">
                    {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" /> Admin Center
                      </Link>
                    )}
                    {(user.role === 'RESTAURANT' || user.role === 'RESTAURANT_ADMIN') && (
                      <Link
                        to="/restaurant/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-orange-700 hover:bg-orange-50 transition-colors"
                      >
                        <Store className="w-4 h-4" /> Restaurant Portal
                      </Link>
                    )}
                    {user.role === 'DELIVERY_PARTNER' && (
                      <Link
                        to="/delivery/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <Bike className="w-4 h-4" /> Delivery Portal
                      </Link>
                    )}
                    {user.role === 'CUSTOMER' && (
                      <>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-brand-600 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" /> My Orders
                        </Link>
                        <Link
                          to="/addresses"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-brand-600 transition-colors"
                        >
                          <MapPin className="w-4 h-4" /> Saved Addresses
                        </Link>
                      </>
                    )}
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-brand-600 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" /> Profile Settings
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 text-left cursor-pointer transition-colors"
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
                className="text-sm font-bold text-slate-700 hover:text-brand-600 px-4 py-2 rounded-2xl hover:bg-orange-50/80 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-2xl transition-all shadow-sm hover:shadow-md"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-brand-600 rounded-xl"
            >
              {link.name}
            </Link>
          ))}
          {isAuthenticated && (
            <div className="pt-2 border-t border-slate-100">
              {user?.role === 'CUSTOMER' && (
                <Link
                  to="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-orange-50 rounded-xl"
                >
                  My Orders
                </Link>
              )}
              {(user?.role === 'RESTAURANT' || user?.role === 'RESTAURANT_ADMIN') && (
                <Link
                  to="/restaurant/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50 rounded-xl"
                >
                  Kitchen Dashboard
                </Link>
              )}
              {user?.role === 'DELIVERY_PARTNER' && (
                <Link
                  to="/delivery/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-bold text-teal-600 hover:bg-teal-50 rounded-xl"
                >
                  Delivery Console
                </Link>
              )}
              {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-bold text-purple-600 hover:bg-purple-50 rounded-xl"
                >
                  Admin Center
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
