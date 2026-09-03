import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/zavora-logo.png"
                alt="Zavora Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-black text-white tracking-tight">ZAVORA</span>
            </Link>
            <p className="text-brand-400 text-xs font-bold tracking-wide">
              Satisfy your hunger instantly
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Zavora Restaurant serves artisanal gourmet dishes cooked fresh with premium ingredients, delivered hot and fresh straight to your doorstep.
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
              <span>100% Quality & Hygiene Guaranteed</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
              Explore Zavora
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/menu" className="hover:text-white transition-colors">
                  Full Menu
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  Food Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Our Kitchen
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li><Link to="/restaurants" className="hover:text-white transition-colors">All Restaurants</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Food Categories</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Zavora</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
              Popular Categories
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/categories?category=Pizza" className="hover:text-white transition-colors">
                  Wood-Fired Pizza
                </Link>
              </li>
              <li>
                <Link to="/categories?category=Burgers" className="hover:text-white transition-colors">
                  Smashed Burgers
                </Link>
              </li>
              <li>
                <Link to="/categories?category=Biryani" className="hover:text-white transition-colors">
                  Royal Dum Biryani
                </Link>
              </li>
              <li>
                <Link to="/categories?category=North%20Indian" className="hover:text-white transition-colors">
                  North Indian Curries
                </Link>
              </li>
              <li>
                <Link to="/categories?category=Desserts" className="hover:text-white transition-colors">
                  Artisanal Desserts
                </Link>
              </li>
            </ul>
          </div>

          {/* Visit / Contact Us */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
              Restaurant & Hours
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>88 Brigade Road, Ashok Nagar, Bengaluru 560025</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+91 80 4123 9901</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>restaurant@zavora.com</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Open Daily: 11:00 AM - 11:30 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Zavora Restaurant. All rights reserved.</p>
          <p>© {new Date().getFullYear()} ZAVORA Platform. All rights reserved. Proprietary Enterprise System.</p>
          <div className="flex items-center gap-4">
            <span>Bengaluru, Karnataka</span>
            <span>•</span>
            <span>Satisfy your hunger instantly</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
