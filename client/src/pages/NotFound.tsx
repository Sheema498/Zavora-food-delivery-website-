import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button.js';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center p-4 text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-500 flex items-center justify-center shadow-sm">
        <UtensilsCrossed className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900">404 - Page Not Found</h1>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
        Oops! The food or page you are looking for does not exist or has been relocated.
      </p>
      <Link to="/restaurants">
        <Button variant="primary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Restaurants
        </Button>
      </Link>
    </div>
  );
};
