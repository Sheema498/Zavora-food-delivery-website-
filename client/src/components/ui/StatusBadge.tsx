import React from 'react';
import { OrderStatus } from '../../types/index.js';
import { ORDER_STATUS_CONFIG } from '../../constants/index.js';

export const StatusBadge: React.FC<{ status: OrderStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const config = ORDER_STATUS_CONFIG[status] || {
    label: status,
    color: 'text-slate-700',
    bgColor: 'bg-slate-100 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bgColor} ${config.color} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse-subtle" />
      {config.label}
    </span>
  );
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'danger' | 'warning' | 'info' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}> = ({ children, variant = 'brand', size = 'md', className = '' }) => {
  const styles = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg border ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};
