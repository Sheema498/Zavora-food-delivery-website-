import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Lock, Mail, User as UserIcon, Phone, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const payload = {
        name,
        email,
        password,
        phone,
      };

      await register(payload);
      navigate('/menu');
      if (role === 'DELIVERY_PARTNER') {
        payload.vehicleType = vehicleType;
        payload.vehicleNumber = vehicleNumber || 'KA-01-TEMP-101';
        payload.licenseNumber = licenseNumber || 'DL-TEMP-2025';
      } else if (role === 'RESTAURANT') {
        payload.restaurantName = restaurantName || `${name}'s Kitchen`;
        payload.restaurantAddress = restaurantAddress || 'Indiranagar, Bengaluru';
        payload.cuisineTypes = cuisineTypes;
      }

      const res = await register(payload);

      if (res.user.role === 'RESTAURANT' || res.user.role === 'RESTAURANT_ADMIN') navigate('/restaurant/dashboard');
      else if (res.user.role === 'DELIVERY_PARTNER') navigate('/delivery/dashboard');
      else if (res.user.role === 'ADMIN' || res.user.role === 'SUPER_ADMIN') navigate('/admin/dashboard');
      else navigate('/restaurants');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src="/zavora-logo.png"
            alt="Zavora Logo"
            className="w-16 h-16 rounded-2xl object-cover mx-auto shadow-md shadow-purple-900/25"
          />
          <h1 className="text-2xl font-black text-slate-900">Create ZAVORA Account</h1>
          <p className="text-xs text-brand-600 font-bold">
            Satisfy your hunger instantly
          </p>
          <p className="text-xs text-slate-500">
            Join as a customer, partner restaurant kitchen, or courier delivery driver
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              role === 'CUSTOMER'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('RESTAURANT')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              role === 'RESTAURANT'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Restaurant
          </button>
          <button
            type="button"
            onClick={() => setRole('DELIVERY_PARTNER')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              role === 'DELIVERY_PARTNER'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Courier Driver
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Alex Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />
          </div>

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Create Zavora Customer Account
        </h1>
        <p className="text-xs text-brand-600 font-bold">Satisfy your hunger instantly</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-100 sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
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
              Create Account
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link to="/login" className="font-bold text-brand-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
