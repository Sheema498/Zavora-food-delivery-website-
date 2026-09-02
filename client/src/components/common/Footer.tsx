import React from 'react';
import { UtensilsCrossed, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">QuickBite</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Real-Time Food Delivery Management System with live GPS tracking, instant driver dispatching, and multi-portal operations.
            </p>
            <div className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Proprietary Client Platform</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Customer</h4>
            <ul className="space-y-2">
              <li><Link to="/restaurants" className="hover:text-white transition-colors">Restaurants & Food</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link to="/addresses" className="hover:text-white transition-colors">Address Book</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Account Profile</Link></li>
            </ul>
          </div>

          {/* Operations Portals */}
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Portals & Ops</h4>
            <ul className="space-y-2">
              <li><Link to="/restaurant/dashboard" className="hover:text-white transition-colors">Restaurant Dashboard</Link></li>
              <li><Link to="/delivery/dashboard" className="hover:text-white transition-colors">Delivery Partner Console</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Admin Control Center</Link></li>
              <li><Link to="/admin/live-orders" className="hover:text-white transition-colors">Live Operations Matrix</Link></li>
            </ul>
          </div>

          {/* Platform Status */}
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">System Status</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Socket.IO Gateway: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Prisma SQLite Engine: Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Live GPS Simulator: Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} QuickBite Platform. All rights reserved. Proprietary Enterprise System.</p>
          <div className="flex items-center gap-4">
            <span>Bangalore, India</span>
            <span>•</span>
            <span className="flex items-center gap-1">Built with React, TypeScript & Node.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
