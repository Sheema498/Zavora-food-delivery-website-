import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { Role } from '../types/index.js';
import { UtensilsCrossed, Lock, Mail, User, Phone, Store, Bike } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('CUSTOMER');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // Delivery partner specifics
  const [vehicleType, setVehicleType] = useState<string>('MOTORBIKE');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [licenseNumber, setLicenseNumber] = useState<string>('');

  // Restaurant specifics
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [restaurantAddress, setRestaurantAddress] = useState<string>('');
  const [cuisineTypes, setCuisineTypes] = useState<string>('Indian, Fast Food');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const payload: Record<string, unknown> = {
        role,
        name,
        email,
        password,
        phone,
      };

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

      if (res.user.role === 'RESTAURANT') navigate('/restaurant/dashboard');
      else if (res.user.role === 'DELIVERY_PARTNER') navigate('/delivery/dashboard');
      else if (res.user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/restaurants');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Create QuickBite Account</h1>
          <p className="text-xs text-slate-500">
            Join as a diner, partner restaurant chef, or courier delivery driver
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

          {/* Role-Specific Fields */}
          {role === 'RESTAURANT' && (
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                <Store className="w-4 h-4 text-blue-600" /> Restaurant Profile Setup
              </div>
              <Input
                label="Restaurant Name"
                placeholder="e.g. Gourmet Burger Lounge"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
              />
              <Input
                label="Store Physical Address"
                placeholder="e.g. 45 Indiranagar, 100ft Road, Bengaluru"
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                required
              />
              <Input
                label="Cuisine Tags"
                placeholder="e.g. Burgers, American, Fast Food"
                value={cuisineTypes}
                onChange={(e) => setCuisineTypes(e.target.value)}
              />
            </div>
          )}

          {role === 'DELIVERY_PARTNER' && (
            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                <Bike className="w-4 h-4 text-teal-600" /> Courier Vehicle Setup
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="MOTORBIKE">Motorbike / Motorcycle</option>
                  <option value="SCOOTER">Scooter / Electric Moped</option>
                  <option value="BICYCLE">Bicycle / Cycle</option>
                  <option value="CAR">Car</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Vehicle Number"
                  placeholder="KA-01-AB-1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                />
                <Input
                  label="Driving License #"
                  placeholder="DL-2024-001"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                />
              </div>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
            Create My QuickBite Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Already registered? </span>
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
