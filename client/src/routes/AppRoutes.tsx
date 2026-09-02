import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Role } from '../types/index.js';

// Common Components
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { Sidebar } from '../components/common/Sidebar.js';
import { CartDrawer } from '../components/customer/CartDrawer.js';
import { NotificationDrawer } from '../components/common/NotificationDrawer.js';
import { ToastContainer } from '../components/ui/ToastContainer.js';

// Customer Pages
import { Home } from '../pages/Home.js';
import { Restaurants } from '../pages/Restaurants.js';
import { RestaurantDetails } from '../pages/RestaurantDetails.js';
import { Checkout } from '../pages/Checkout.js';
import { OrderConfirmation } from '../pages/OrderConfirmation.js';
import { LiveOrderTracking } from '../pages/LiveOrderTracking.js';
import { OrderHistory } from '../pages/OrderHistory.js';
import { CustomerProfile } from '../pages/CustomerProfile.js';
import { Addresses } from '../pages/Addresses.js';
import { Notifications } from '../pages/Notifications.js';

// Restaurant Pages
import { RestaurantDashboard } from '../pages/RestaurantDashboard.js';
import { RestaurantOrders } from '../pages/RestaurantOrders.js';
import { RestaurantMenu } from '../pages/RestaurantMenu.js';
import { RestaurantEarnings } from '../pages/RestaurantEarnings.js';
import { RestaurantReviews } from '../pages/RestaurantReviews.js';
import { RestaurantSettings } from '../pages/RestaurantSettings.js';

// Delivery Pages
import { DeliveryDashboard } from '../pages/DeliveryDashboard.js';
import { DeliveryActive } from '../pages/DeliveryActive.js';
import { DeliveryHistory } from '../pages/DeliveryHistory.js';
import { DeliveryEarnings } from '../pages/DeliveryEarnings.js';
import { DeliveryProfile } from '../pages/DeliveryProfile.js';

// Admin Pages
import { AdminDashboard } from '../pages/AdminDashboard.js';
import { AdminLiveOrders } from '../pages/AdminLiveOrders.js';
import { AdminUsers } from '../pages/AdminUsers.js';
import { AdminRestaurants } from '../pages/AdminRestaurants.js';
import { AdminDrivers } from '../pages/AdminDrivers.js';
import { AdminAuditLogs } from '../pages/AdminAuditLogs.js';
import { AdminSettings } from '../pages/AdminSettings.js';

// Auth Pages
import { Login } from '../pages/Login.js';
import { Register } from '../pages/Register.js';
import { NotFound } from '../pages/NotFound.js';

const MainLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <CartDrawer />
    <NotificationDrawer />
    <ToastContainer />
  </div>
);

const PortalLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <div className="flex-1 max-w-7xl w-full mx-auto flex">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
        <Outlet />
      </main>
    </div>
    <Footer />
    <NotificationDrawer />
    <ToastContainer />
  </div>
);

const RequireAuth: React.FC<{ allowedRoles?: Role[] }> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public & Customer Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/orders/:id/track" element={<LiveOrderTracking />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Restaurant Portal */}
      <Route element={<RequireAuth allowedRoles={['RESTAURANT', 'ADMIN']} />}>
        <Route path="/restaurant" element={<PortalLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RestaurantDashboard />} />
          <Route path="orders" element={<RestaurantOrders />} />
          <Route path="menu" element={<RestaurantMenu />} />
          <Route path="earnings" element={<RestaurantEarnings />} />
          <Route path="reviews" element={<RestaurantReviews />} />
          <Route path="settings" element={<RestaurantSettings />} />
        </Route>
      </Route>

      {/* Delivery Partner Portal */}
      <Route element={<RequireAuth allowedRoles={['DELIVERY_PARTNER', 'ADMIN']} />}>
        <Route path="/delivery" element={<PortalLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DeliveryDashboard />} />
          <Route path="active" element={<DeliveryActive />} />
          <Route path="history" element={<DeliveryHistory />} />
          <Route path="earnings" element={<DeliveryEarnings />} />
          <Route path="profile" element={<DeliveryProfile />} />
        </Route>
      </Route>

      {/* Admin Control Center */}
      <Route element={<RequireAuth allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<PortalLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="live-orders" element={<AdminLiveOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="restaurants" element={<AdminRestaurants />} />
          <Route path="drivers" element={<AdminDrivers />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  );
};
