import React, { useState } from 'react';
import { Order, RestaurantReview } from '../../types/index.js';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { RatingStars } from '../common/RatingStars.js';
import { reviewService } from '../../services/reviewService.js';

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onReviewSubmitted: (review: RestaurantReview) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  order,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const review = await reviewService.createReview({
        orderId: order.id,
        rating,
        comment,
      });
      onReviewSubmitted(review);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate Your Zavora Meal Experience"
      description={`Order #${order.orderNumber} from ${order.restaurant.name}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-xs text-rose-500 bg-rose-50 p-2.5 rounded-xl">{error}</p>}

        <div className="flex flex-col items-center justify-center py-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-2">How was your food and delivery?</p>
          <RatingStars rating={rating} size="lg" interactive onChange={(r) => setRating(r)} />
          <span className="text-xs font-bold text-amber-600 mt-2">
            {rating === 5
              ? '⭐⭐⭐⭐⭐ Superb / Delicious!'
              : rating === 4
              ? '⭐⭐⭐⭐ Great experience'
              : rating === 3
              ? '⭐⭐⭐ Average'
              : rating === 2
              ? '⭐⭐ Below expectations'
              : '⭐ Poor'}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Write a Review (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Share what you enjoyed or any feedback for the chef..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Skip
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Submit Rating & Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
