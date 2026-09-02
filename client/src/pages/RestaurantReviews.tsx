import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { restaurantService } from '../services/restaurantService.js';
import { reviewService } from '../services/reviewService.js';
import { RestaurantReview } from '../types/index.js';
import { RatingStars } from '../components/common/RatingStars.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import { MessageSquare, Star, Reply, CheckCircle2 } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters.js';

export const RestaurantReviews: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [restaurantRating, setRestaurantRating] = useState<number>(4.8);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedReviewForReply, setSelectedReviewForReply] = useState<RestaurantReview | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isReplying, setIsReplying] = useState<boolean>(false);

  const fetchReviews = async () => {
    if (!user?.restaurantId) return;
    try {
      setIsLoading(true);
      const rest = await restaurantService.getRestaurant(user.restaurantId);
      setReviews(rest.reviews || []);
      setRestaurantRating(rest.rating);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user?.restaurantId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForReply || !replyText.trim()) return;

    try {
      setIsReplying(true);
      await reviewService.replyToReview(selectedReviewForReply.id, replyText.trim(), user?.restaurantId);
      setSelectedReviewForReply(null);
      setReplyText('');
      fetchReviews();
    } catch (err: any) {
      alert(err.message || 'Failed to submit reply');
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Customer Ratings & Reviews</h1>
          <p className="text-xs text-slate-500">
            Read verified feedback from diners and respond directly as the restaurant chef
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span className="text-base font-black text-slate-900">{restaurantRating.toFixed(1)}</span>
          <span className="text-xs text-slate-400">/ 5.0 Rating</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
          <MessageSquare className="w-12 h-12 mx-auto stroke-[1.5] mb-2 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No customer reviews yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Completed orders with ratings will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      review.customer?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        review.customer?.name || 'Customer'
                      )}&background=f97316&color=fff`
                    }
                    alt="Customer"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {review.customer?.name || 'Customer'}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {formatTimeAgo(review.createdAt)}
                    </span>
                  </div>
                </div>

                <RatingStars rating={review.rating} size="sm" />
              </div>

              {review.comment && (
                <p className="text-xs text-slate-700 leading-relaxed">{review.comment}</p>
              )}

              {review.replyFromRestaurant ? (
                <div className="p-3 bg-slate-50 border-l-2 border-brand-500 rounded-r-xl text-xs space-y-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" /> Your Restaurant Response:
                  </span>
                  <p className="text-slate-600">{review.replyFromRestaurant}</p>
                </div>
              ) : (
                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={() => {
                      setSelectedReviewForReply(review);
                      setReplyText('');
                    }}
                    variant="outline"
                    size="xs"
                    icon={<Reply className="w-3.5 h-3.5" />}
                  >
                    Reply to Customer
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {selectedReviewForReply && (
        <Modal
          isOpen={!!selectedReviewForReply}
          onClose={() => setSelectedReviewForReply(null)}
          title="Reply to Customer Review"
          maxWidth="sm"
        >
          <form onSubmit={handleSendReply} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
              <p className="italic">"{selectedReviewForReply.comment}"</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Response (Public)
              </label>
              <textarea
                rows={3}
                placeholder="Thank the customer or explain how you addressed their feedback..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" onClick={() => setSelectedReviewForReply(null)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isReplying}>
                Publish Reply
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
