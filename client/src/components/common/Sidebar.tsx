import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  DollarSign,
  Star,
  Settings,
  Bike,
  Activity,
  Users,
  Store,
  FileText,
  Radio,
  Clock,
  RadioTower,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  let links: Array<{ to: string; label: string; icon: React.ReactNode }> = [];

  if (role === 'RESTAURANT' || role === 'RESTAURANT_ADMIN') {
    links = [
      { to: '/restaurant/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      { to: '/restaurant/orders', label: 'Live Orders Queue', icon: <ShoppingBag className="w-4 h-4" /> },
      { to: '/restaurant/menu', label: 'Menu & Food Items', icon: <UtensilsCrossed className="w-4 h-4" /> },
      { to: '/restaurant/earnings', label: 'Earnings & Payouts', icon: <DollarSign className="w-4 h-4" /> },
      { to: '/restaurant/reviews', label: 'Customer Reviews', icon: <Star className="w-4 h-4" /> },
      { to: '/restaurant/settings', label: 'Kitchen Settings', icon: <Settings className="w-4 h-4" /> },
    ];
  } else if (role === 'DELIVERY_PARTNER') {
    links = [
      { to: '/delivery/dashboard', label: 'Driver Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { to: '/delivery/active', label: 'Active Delivery & GPS', icon: <Bike className="w-4 h-4" /> },
      { to: '/delivery/history', label: 'Delivery History', icon: <Clock className="w-4 h-4" /> },
      { to: '/delivery/earnings', label: 'Shift Earnings', icon: <DollarSign className="w-4 h-4" /> },
      { to: '/delivery/profile', label: 'Vehicle Profile', icon: <Settings className="w-4 h-4" /> },
    ];
  } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    links = [
      { to: '/admin/dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { to: '/admin/live-operations', label: 'Live Operations Matrix', icon: <RadioTower className="w-4 h-4" /> },
      { to: '/admin/live-orders', label: 'Central Courier Dispatch', icon: <Radio className="w-4 h-4" /> },
      { to: '/admin/users', label: 'Users & Customers', icon: <Users className="w-4 h-4" /> },
      { to: '/admin/restaurants', label: 'Restaurants Manager', icon: <Store className="w-4 h-4" /> },
      { to: '/admin/drivers', label: 'Delivery Fleets', icon: <Bike className="w-4 h-4" /> },
      { to: '/admin/audit-logs', label: 'Security & Audit Logs', icon: <FileText className="w-4 h-4" /> },
      { to: '/admin/settings', label: 'Platform Parameters', icon: <Settings className="w-4 h-4" /> },
    ];
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 shrink-0 hidden md:block">
      {/* Brand Badge */}
      <div className="flex items-center gap-3 px-3 py-2.5 mb-4 bg-purple-50/50 rounded-2xl border border-purple-100">
        <img
          src="/zavora-logo.png"
          alt="Zavora Logo"
          className="w-8 h-8 rounded-xl object-cover shadow-sm"
        />
        <div className="min-w-0">
          <p className="text-xs font-black text-slate-900 tracking-tight">ZAVORA</p>
          <p className="text-[10px] font-bold text-brand-600 truncate">Portal Suite</p>
        </div>
      </div>

      <div className="mb-6 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Activity className="w-3.5 h-3.5 text-brand-500" />
          <span>{role.replace(/_/g, ' ')} PORTAL</span>
        </div>
        <p className="text-xs font-semibold text-slate-800 mt-1 truncate">{user.name}</p>
      </div>

      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
