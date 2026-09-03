import React from 'react';
import { ChefHat, ShieldCheck, Flame, Heart, MapPin, Clock, Award, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Story & Mission</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          About Zavora Restaurant
        </h1>
        <p className="text-base text-brand-600 font-bold max-w-xl mx-auto">
          "Satisfy your hunger instantly"
        </p>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Founded in Bengaluru, Zavora is a culinary destination built on the conviction that food delivery should never compromise on restaurant-grade freshness, flavor, or speed.
        </p>
      </div>

      {/* Hero Image & Values */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900">
              Fresh Ingredients, Mastered Cooking
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              At Zavora Restaurant, we don't operate a faceless aggregation marketplace. We run a dedicated kitchen where our master chefs curate artisanal wood-fired pizzas, slow-simmered dum biryanis, crispy smash burgers, and rich authentic curries.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every order is prepared fresh on-demand upon kitchen acceptance, securely packaged in thermal containers, and handed directly to our dedicated delivery courier.
            </p>
          </div>

          <div className="bg-gradient-to-tr from-brand-50 to-orange-100 rounded-2xl p-6 text-center space-y-4 border border-brand-100">
            <img
              src="/zavora-logo.png"
              alt="Zavora"
              className="h-20 w-auto mx-auto object-contain"
            />
            <h3 className="text-base font-bold text-slate-900">Zavora Culinary Hub</h3>
            <p className="text-xs text-slate-600">
              88 Brigade Road, Ashok Nagar, Bengaluru 560025
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-brand-600">
              <Clock className="w-4 h-4" />
              <span>Open 11:00 AM - 11:30 PM Daily</span>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-brand-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Always Cooked Fresh</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              No pre-cooked shortcuts or frozen patties. Everything is fired fresh when you order.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Hygiene First</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Temperature-controlled prep stations, sanitized kitchens, and tamper-evident packaging.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Dedicated Couriers</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our single-courier delivery system ensures reliable, prompt, and live-tracked delivery.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-sm shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
        >
          <span>Explore Our Menu</span>
        </Link>
      </div>
    </div>
  );
};
