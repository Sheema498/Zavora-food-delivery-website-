import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars: React.FC<{
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}> = ({ rating, max = 5, size = 'md', interactive = false, onChange }) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: max }).map((_, idx) => {
        const starNum = idx + 1;
        const isFilled = starNum <= Math.round(rating);

        return (
          <button
            key={idx}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starNum)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200 fill-slate-100'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
