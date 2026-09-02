import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Cart, FoodItem, Coupon } from '../types/index.js';
import { cartService } from '../services/cartService.js';
import { couponService } from '../services/couponService.js';
import { useAuth } from './AuthContext.js';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isCartDrawerOpen: boolean;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  restaurantConflict: {
    isOpen: boolean;
    pendingFoodItem: FoodItem | null;
  };
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addToCart: (foodItem: FoodItem, quantity?: number, specialInstructions?: string) => Promise<void>;
  confirmClearAndAdd: () => Promise<void>;
  cancelRestaurantConflict: () => void;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; discountAmount: number; error?: string }>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  const [restaurantConflict, setRestaurantConflict] = useState<{
    isOpen: boolean;
    pendingFoodItem: FoodItem | null;
  }>({
    isOpen: false,
    pendingFoodItem: null,
  });

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      setCart(null);
      return;
    }
    try {
      setIsLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.warn('Failed to fetch cart:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  const addToCart = async (
    foodItem: FoodItem,
    quantity = 1,
    specialInstructions?: string
  ): Promise<void> => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    try {
      const updatedCart = await cartService.addItem(
        foodItem.id,
        quantity,
        specialInstructions,
        false
      );
      setCart(updatedCart);
      openCartDrawer();
    } catch (err: any) {
      if (err.message && err.message.includes('another restaurant')) {
        setRestaurantConflict({
          isOpen: true,
          pendingFoodItem: foodItem,
        });
      } else {
        alert(err.message || 'Failed to add item to cart');
      }
    }
  };

  const confirmClearAndAdd = async () => {
    if (!restaurantConflict.pendingFoodItem) return;
    try {
      const updatedCart = await cartService.addItem(
        restaurantConflict.pendingFoodItem.id,
        1,
        undefined,
        true
      );
      setCart(updatedCart);
      setRestaurantConflict({ isOpen: false, pendingFoodItem: null });
      removeCoupon();
      openCartDrawer();
    } catch (err: any) {
      alert(err.message || 'Failed to replace cart items');
    }
  };

  const cancelRestaurantConflict = () => {
    setRestaurantConflict({ isOpen: false, pendingFoodItem: null });
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const updatedCart = await cartService.updateQuantity(cartItemId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      alert(err.message || 'Failed to update quantity');
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const updatedCart = await cartService.removeItem(cartItemId);
      setCart(updatedCart);
    } catch (err: any) {
      alert(err.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart({
        cartId: cart?.cartId || '',
        restaurant: null,
        items: [],
        itemCount: 0,
        subtotal: 0,
      });
      removeCoupon();
    } catch (err: any) {
      alert(err.message || 'Failed to clear cart');
    }
  };

  const applyCoupon = async (code: string) => {
    if (!cart || cart.subtotal <= 0) {
      return { success: false, discountAmount: 0, error: 'Add items to cart first' };
    }
    try {
      const result = await couponService.validateCoupon(code, cart.subtotal);
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discountAmount);
      return { success: true, discountAmount: result.discountAmount };
    } catch (err: any) {
      return { success: false, discountAmount: 0, error: err.message || 'Invalid coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isCartDrawerOpen,
        appliedCoupon,
        couponDiscount,
        restaurantConflict,
        openCartDrawer,
        closeCartDrawer,
        addToCart,
        confirmClearAndAdd,
        cancelRestaurantConflict,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
