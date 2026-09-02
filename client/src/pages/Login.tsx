import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { DEMO_CREDENTIALS } from '../constants/index.js';
import { UtensilsCrossed, Lock, Mail, Sparkles } from 'lucide-react';
import { Role } from '../types/index.js';

export const Login: React.FC = () => {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';
  const redirectUrl = queryParams.get('redirect') || '/';

  const [email, setEmail] = useState<string>('customer@example.com');
  const [password, setPassword] = useState<string>('Password123!');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const res = await login(email, password);

      // Redirect by role
      if (res.user.role === 'RESTAURANT') navigate('/restaurant/dashboard');
      else if (res.user.role === 'DELIVERY_PARTNER') navigate('/delivery/dashboard');
      else if (res.user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate(redirectUrl === '/login' ? '/restaurants' : redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: Role) => {
    try {
      setIsLoading(true);
      setError(null);
      await quickDemoLogin(role);

      if (role === 'CUSTOMER') navigate('/restaurants');
      else if (role === 'RESTAURANT') navigate('/restaurant/dashboard');
      else if (role === 'DELIVERY_PARTNER') navigate('/delivery/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
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

          <div className="grid grid-cols-2 gap-2">
            {DEMO_CREDENTIALS.map((demo) => (
              <button
                key={demo.role}
                type="button"
                onClick={() => handleDemoLogin(demo.role)}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all hover:border-brand-300 cursor-pointer"
              >
                <span className="text-[11px] font-bold text-slate-900 block truncate">
                  {demo.badge}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  {demo.email.split('@')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
            Sign In to QuickBite
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};
