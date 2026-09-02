import React from 'react';
import { UtensilsCrossed, ShieldCheck, Zap, Bike, HeartHandshake, Award, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-100 text-brand-700 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>About QuickBite Platform</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Next-Generation Real-Time Food Delivery Management
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          QuickBite connects passionate local chefs, hungry customers, and agile delivery partners on a single synchronized platform powered by real-time WebSocket orchestration and keyless topological vector cartography.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Zero Refresh Live Sync</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bidirectional Socket.IO events keep customers, kitchen chefs, drivers, and administrators instantaneously updated without manual polling.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Bike className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Keyless Live GPS Tracking</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Turn-by-turn road simulation with shortest path Dijkstra graph traversal, bearing rotation, and live courier broadcast coordinates.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Audited Financials</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Double-entry platform accounting, automated GST tax calculation with SAC codes, driver tipping, and transparent 85% restaurant payouts.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">100k+ Production Code</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Engineered with strict TypeScript typing, Prisma ORM relational modeling, comprehensive Vitest integration suites, and security guards.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white text-center space-y-4 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-black">Ready to experience fresh food delivery?</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Explore artisanal partner restaurants in your neighborhood and track your delivery live from the kitchen to your table.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <Link
            to="/restaurants"
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all"
          >
            Explore Restaurants
          </Link>
          <Link
            to="/categories"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    </div>
  );
};
