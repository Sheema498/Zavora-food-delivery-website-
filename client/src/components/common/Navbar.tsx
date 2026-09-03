import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import {
  ShoppingBag,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  MapPin,
  UtensilsCrossed,
  ShieldCheck,
  Bike,
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
    { name: 'Menu', path: '/menu' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zavora Logo (Preserving original aspect ratio & transparency) */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/zavora-logo.png"
            alt="Zavora Logo"
            className="h-11 w-auto max-w-[140px] object-contain transition-transform group-hover:scale-105"
          />
          <div className="hidden sm:block">
            <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
              ZAVORA
            </span>
            <span className="text-[10px] font-bold text-brand-600 block tracking-wider">
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

        {/* Center Nav Links for Single Restaurant */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-semibold transition-colors hover:text-brand-600 ${
                location.pathname === link.path
                  ? 'text-brand-600 font-bold border-b-2 border-brand-500 pb-0.5'
                  : 'text-slate-600'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Customer Authenticated Navigation */}
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

          {/* Staff Quick Link if staff is on customer site */}
          {isAuthenticated &&
            (user?.role === 'RESTAURANT_MANAGER' ||
              user?.role === 'RESTAURANT' ||
              user?.role === 'RESTAURANT_ADMIN') && (
              <Link
                to="/manager/dashboard"
                className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl hover:bg-orange-100 transition-colors flex items-center gap-1.5"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Kitchen Console</span>
              </Link>
            )}

          {isAuthenticated && (user?.role === 'DELIVERY_BOY' || user?.role === 'DELIVERY_PARTNER') && (
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
              className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl hover:bg-teal-100 transition-colors flex items-center gap-1.5"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Courier Portal</span>
            </Link>
          )}

          {isAuthenticated && (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
          {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <Link
              to="/admin/dashboard"
              className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </Link>
          )}
        </nav>

        {/* Right Actions (Cart, Notifications, Auth) */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <button
            onClick={openCartDrawer}
            className="relative p-2.5 rounded-2xl bg-orange-50 text-slate-700 hover:text-brand-600 hover:bg-orange-100/70 transition-all border border-orange-100 cursor-pointer"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            {Boolean(cart && cart.itemCount > 0) && (
              <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                {cart?.itemCount}
              </span>
            )}
          </button>

          {/* Notifications Icon (when authenticated) */}
          {isAuthenticated && (
            <button
              onClick={openDrawer}
              className="relative p-2.5 rounded-2xl bg-slate-50 text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-all border border-slate-100 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Auth Button */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:block text-xs font-bold text-slate-800 max-w-[120px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scale-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-md uppercase">
                      {user.role.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="py-1">
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
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                        >
                          <ShoppingBag className="w-4 h-4 text-slate-400" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          to="/addresses"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                        >
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>Saved Addresses</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>Customer Profile</span>
                        </Link>
                      </>
                    )}

                    {(user.role === 'RESTAURANT_MANAGER' ||
                      user.role === 'RESTAURANT' ||
                      user.role === 'RESTAURANT_ADMIN') && (
                      <Link
                        to="/manager/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50"
                      >
                        <UtensilsCrossed className="w-4 h-4" />
                        <span>Manager Kitchen Portal</span>
                      </Link>
                    )}

                    {(user.role === 'DELIVERY_BOY' || user.role === 'DELIVERY_PARTNER') && (
                      <Link
                        to="/delivery/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Delivery Boy Console</span>
                      </Link>
                    )}

                    {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Super Admin Center</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-700 hover:text-brand-600 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-xl shadow-sm transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block py-2 text-sm font-semibold ${
                location.pathname === link.path ? 'text-brand-600 font-bold' : 'text-slate-700'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {isAuthenticated && user?.role === 'CUSTOMER' && (
            <Link
              to="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700"
            >
              My Orders
            </Link>
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
