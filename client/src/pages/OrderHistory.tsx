import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService.js';
import { Order, RestaurantReview } from '../types/index.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Button } from '../components/ui/Button.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { ReviewModal } from '../components/customer/ReviewModal.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import { ShoppingBag, Star, Navigation } from 'lucide-react';

export const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await orderService.getCustomerOrders();
        setOrders(data.orders);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Your Orders</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Track active deliveries in real-time or review past gourmet meals
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No orders placed yet"
          description="Hungry? Explore our curated selection of artisanal kitchens and place your first order!"
          actionText="Browse Restaurants"
          onAction={() => (window.location.href = '/restaurants')}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isActive =
              order.status !== 'DELIVERED' &&
              order.status !== 'CANCELLED' &&
              order.status !== 'RESTAURANT_REJECTED';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-card transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      <img
                        src={
                          order.restaurant.logoUrl ||
                          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150'
                        }
                        alt={order.restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {order.restaurant.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Order #{order.orderNumber} • {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  {order.items.map((item) => (
                    <span key={item.id} className="bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="text-xs">
                    <span className="text-slate-400">Total Paid: </span>
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <Link to={`/orders/${order.id}/track`}>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Navigation className="w-3.5 h-3.5" />}
                        >
                          Live GPS Track
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Link to={`/orders/${order.id}/track`}>
                          <Button variant="outline" size="sm">
                            View Receipt
                          </Button>
                        </Link>

                        {order.status === 'DELIVERED' && !order.review && (
                          <Button
                            onClick={() => setSelectedOrderForReview(order)}
                            variant="primary"
                            size="sm"
                            icon={<Star className="w-3.5 h-3.5 fill-white" />}
                          >
                            Rate Order
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedOrderForReview && (
        <ReviewModal
          isOpen={!!selectedOrderForReview}
          onClose={() => setSelectedOrderForReview(null)}
          order={selectedOrderForReview}
          onReviewSubmitted={(review: RestaurantReview) => {
            setOrders((prev) =>
              prev.map((o) => (o.id === selectedOrderForReview.id ? { ...o, review } : o))
            );
          }}
        />
      )}
    </div>
  );
};
