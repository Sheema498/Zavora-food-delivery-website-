import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Role } from '../types/index.js';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { DEMO_CREDENTIALS } from '../constants/index.js';

export const Login: React.FC = () => {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const redirectByRole = (role: Role) => {
    if (role === 'RESTAURANT_MANAGER' || role === 'RESTAURANT' || role === 'RESTAURANT_ADMIN') {
      navigate('/manager/dashboard');
    } else if (role === 'DELIVERY_BOY' || role === 'DELIVERY_PARTNER') {
      navigate('/delivery/dashboard');
    } else if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password);
      redirectByRole(res.user.role);

      // Redirect by role
      if (res.user.role === 'RESTAURANT' || res.user.role === 'RESTAURANT_ADMIN') navigate('/restaurant/dashboard');
      else if (res.user.role === 'DELIVERY_PARTNER') navigate('/delivery/dashboard');
      else if (res.user.role === 'ADMIN' || res.user.role === 'SUPER_ADMIN') navigate('/admin/dashboard');
      else navigate(redirectUrl === '/login' ? '/restaurants' : redirectUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: Role) => {
    setError('');
    setIsLoading(true);
    try {
      await quickDemoLogin(role);
      redirectByRole(role);

      if (role === 'CUSTOMER') navigate('/restaurants');
      else if (role === 'RESTAURANT' || role === 'RESTAURANT_ADMIN') navigate('/restaurant/dashboard');
      else if (role === 'DELIVERY_PARTNER') navigate('/delivery/dashboard');
      else if (role === 'ADMIN' || role === 'SUPER_ADMIN') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Quick demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <Link to="/" className="inline-block">
          <img
            src="/zavora-logo.png"
            alt="Zavora"
            className="h-16 w-auto mx-auto object-contain"
          />
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome to Zavora
        </h1>
        <p className="text-xs text-brand-600 font-bold">Satisfy your hunger instantly</p>
      </div>
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <img
            src="/zavora-logo.png"
            alt="Zavora Logo"
            className="w-16 h-16 rounded-2xl object-cover mx-auto shadow-md shadow-purple-900/25"
          />
          <h1 className="text-2xl font-black text-slate-900">Welcome to ZAVORA</h1>
          <p className="text-xs text-brand-600 font-bold">
            Satisfy your hunger instantly
          </p>
          <p className="text-xs text-slate-500">
            Sign in to access your dashboard and live delivery management
          </p>
        </div>

        {isExpired && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl text-center">
            Your previous session has expired. Please log in again.
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* 1-Click Fast Demo Login Buttons */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1 text-brand-600">
              <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Logins:
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Pre-filled & active</span>
          </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-100 sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@zavora.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-400 focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 font-bold"
            >
              Sign In to Account
            </Button>
          </form>

          {/* Quick Demo Login Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Demo Quick Sign-In</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('CUSTOMER')}
                className="p-2 text-left rounded-xl bg-orange-50 hover:bg-orange-100/70 border border-orange-200 transition-colors cursor-pointer"
              >
                <p className="text-xs font-bold text-orange-900">Customer</p>
                <p className="text-[10px] text-orange-600">customer@zavora.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('RESTAURANT_MANAGER')}
                className="p-2 text-left rounded-xl bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200 transition-colors cursor-pointer"
              >
                <p className="text-xs font-bold text-indigo-900">Manager</p>
                <p className="text-[10px] text-indigo-600">manager@zavora.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('DELIVERY_BOY')}
                className="p-2 text-left rounded-xl bg-teal-50 hover:bg-teal-100/70 border border-teal-200 transition-colors cursor-pointer"
              >
                <p className="text-xs font-bold text-teal-900">Delivery Boy</p>
                <p className="text-[10px] text-teal-600">delivery@zavora.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('SUPER_ADMIN')}
                className="p-2 text-left rounded-xl bg-purple-50 hover:bg-purple-100/70 border border-purple-200 transition-colors cursor-pointer"
              >
                <p className="text-xs font-bold text-purple-900">Super Admin</p>
                <p className="text-[10px] text-purple-600">admin@zavora.com</p>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-slate-500">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create Customer Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
