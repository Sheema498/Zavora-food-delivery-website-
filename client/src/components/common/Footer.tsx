import React from 'react';
import { UtensilsCrossed, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/zavora-logo.png"
                alt="Zavora Logo"
                className="w-9 h-9 rounded-xl object-cover shadow-sm"
              />
              <span className="text-lg font-black text-white tracking-tight">ZAVORA</span>
            </Link>
            <p className="text-brand-400 text-xs font-semibold">
              Satisfy your hunger instantly
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Real-Time Food Delivery Management Platform connecting customers, restaurants, delivery partners, and central dispatch with live GPS tracking.
            </p>
            <div className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Proprietary Client Platform</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Explore</h4>
            <ul className="space-y-2">
              <li><Link to="/restaurants" className="hover:text-white transition-colors">All Restaurants</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Food Categories</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Zavora</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Operations Portals */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Role Portals</h4>
            <ul className="space-y-2">
              <li><Link to="/restaurant/dashboard" className="hover:text-white transition-colors">Restaurant Kitchen Portal</Link></li>
              <li><Link to="/delivery/dashboard" className="hover:text-white transition-colors">Delivery Courier Portal</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Admin Control Center</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Customer Order Tracking</Link></li>
            </ul>
          </div>

          {/* Platform Status */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">System Status</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Socket.IO Gateway: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Prisma Database: Synchronized</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Live GPS Simulator: Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} ZAVORA Platform. All rights reserved. Proprietary Enterprise System.</p>
          <div className="flex items-center gap-4">
            <span>Bengaluru, India</span>
            <span>•</span>
            <span className="flex items-center gap-1">Built with React, TypeScript & Node.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
