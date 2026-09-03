import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Role } from '../types/index.js';

// Layouts
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { CartDrawer } from '../components/customer/CartDrawer.js';
import { NotificationDrawer } from '../components/common/NotificationDrawer.js';
import { ToastContainer } from '../components/ui/ToastContainer.js';
import { ManagerLayout } from '../components/layout/ManagerLayout.js';
import { DeliveryLayout } from '../components/layout/DeliveryLayout.js';
import { AdminLayout } from '../components/layout/AdminLayout.js';

// Customer Pages
import { Home } from '../pages/Home.js';
import { Menu } from '../pages/Menu.js';
import { Categories } from '../pages/Categories.js';
import { About } from '../pages/About.js';
import { Contact } from '../pages/Contact.js';
import { Checkout } from '../pages/Checkout.js';
import { OrderConfirmation } from '../pages/OrderConfirmation.js';
import { LiveOrderTracking } from '../pages/LiveOrderTracking.js';
import { OrderHistory } from '../pages/OrderHistory.js';
import { CustomerProfile } from '../pages/CustomerProfile.js';
import { Addresses } from '../pages/Addresses.js';
import { Notifications } from '../pages/Notifications.js';

// Restaurant Manager Pages
import { RestaurantDashboard } from '../pages/RestaurantDashboard.js';
import { RestaurantOrders } from '../pages/RestaurantOrders.js';
import { RestaurantMenu } from '../pages/RestaurantMenu.js';
import { RestaurantEarnings } from '../pages/RestaurantEarnings.js';
import { RestaurantReviews } from '../pages/RestaurantReviews.js';
import { RestaurantSettings } from '../pages/RestaurantSettings.js';

// Delivery Boy Pages
import { DeliveryDashboard } from '../pages/DeliveryDashboard.js';
import { DeliveryActive } from '../pages/DeliveryActive.js';
import { DeliveryHistory } from '../pages/DeliveryHistory.js';
import { DeliveryEarnings } from '../pages/DeliveryEarnings.js';
import { DeliveryProfile } from '../pages/DeliveryProfile.js';

// Super Admin Pages
import { AdminDashboard } from '../pages/AdminDashboard.js';
import { AdminLiveOrders } from '../pages/AdminLiveOrders.js';
import { AdminUsers } from '../pages/AdminUsers.js';
import { AdminAuditLogs } from '../pages/AdminAuditLogs.js';
import { AdminSettings } from '../pages/AdminSettings.js';

// Auth Pages
import { Login } from '../pages/Login.js';
import { Register } from '../pages/Register.js';
import { NotFound } from '../pages/NotFound.js';

// Customer Public & Private Layout
const MainLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-800">
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

// Route Protection Guard
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

  if (allowedRoles) {
    // Check canonical role with backward-compatible mappings
    let currentRole = user.role;
    const isAllowed = allowedRoles.some((role) => {
      if (role === currentRole) return true;
      if (
        (role === 'RESTAURANT_MANAGER' && ['RESTAURANT', 'RESTAURANT_ADMIN'].includes(currentRole)) ||
        (role === 'RESTAURANT' && currentRole === 'RESTAURANT_MANAGER')
      )
        return true;
      if (
        (role === 'DELIVERY_BOY' && currentRole === 'DELIVERY_PARTNER') ||
        (role === 'DELIVERY_PARTNER' && currentRole === 'DELIVERY_BOY')
      )
        return true;
      if (
        (role === 'SUPER_ADMIN' && currentRole === 'ADMIN') ||
        (role === 'ADMIN' && currentRole === 'SUPER_ADMIN')
      )
        return true;
      return false;
    });

    if (!isAllowed) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Customer Website Layout (Public & Customer Pages) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirect old multi-restaurant routes to single-restaurant Menu */}
        <Route path="/restaurants" element={<Navigate to="/menu" replace />} />
        <Route path="/restaurant/:id" element={<Navigate to="/menu" replace />} />

        {/* Customer Protected Pages */}
        <Route element={<RequireAuth allowedRoles={['CUSTOMER']} />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Order Tracking (Customer and assigned delivery boy only) */}
        <Route
          element={
            <RequireAuth
              allowedRoles={[
                'CUSTOMER',
                'DELIVERY_BOY',
                'DELIVERY_PARTNER',
              ]}
            />
          }
        >
          <Route path="/orders/:id/track" element={<LiveOrderTracking />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 2. Restaurant Manager Portal (Dedicated ManagerLayout - NO Customer Navbar/Footer, NO GPS) */}
      <Route
        element={
          <RequireAuth
            allowedRoles={['RESTAURANT_MANAGER', 'RESTAURANT', 'RESTAURANT_ADMIN']}
          />
        }
      >
        <Route path="/manager" element={<ManagerLayout />}>
      {/* Restaurant Portal */}
      <Route element={<RequireAuth allowedRoles={['RESTAURANT', 'RESTAURANT_ADMIN', 'ADMIN', 'SUPER_ADMIN']} />}>
        <Route path="/restaurant" element={<PortalLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RestaurantDashboard />} />
          <Route path="orders" element={<RestaurantOrders />} />
          <Route path="orders/:id" element={<RestaurantOrders />} />
          <Route path="menu" element={<RestaurantMenu />} />
          <Route path="categories" element={<RestaurantMenu />} />
          <Route path="earnings" element={<RestaurantEarnings />} />
          <Route path="reviews" element={<RestaurantReviews />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<RestaurantSettings />} />
        </Route>
      </Route>

      {/* Redirect old /restaurant to /manager */}
      <Route path="/restaurant/*" element={<Navigate to="/manager/dashboard" replace />} />

      {/* 3. Delivery Boy Portal (Dedicated DeliveryLayout - Mobile-friendly Courier Console) */}
      <Route
        element={
          <RequireAuth
            allowedRoles={['DELIVERY_BOY', 'DELIVERY_PARTNER']}
          />
        }
      >
        <Route path="/delivery" element={<DeliveryLayout />}>
      {/* Delivery Partner Portal */}
      <Route element={<RequireAuth allowedRoles={['DELIVERY_PARTNER', 'ADMIN', 'SUPER_ADMIN']} />}>
        <Route path="/delivery" element={<PortalLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DeliveryDashboard />} />
          <Route path="active" element={<DeliveryActive />} />
          <Route path="history" element={<DeliveryHistory />} />
          <Route path="earnings" element={<DeliveryEarnings />} />
          <Route path="profile" element={<DeliveryProfile />} />
        </Route>
      </Route>

      {/* 4. Super Admin Control Center (Dedicated AdminLayout - Real Aggregations, NO GPS) */}
      <Route
        element={
          <RequireAuth
            allowedRoles={['SUPER_ADMIN', 'ADMIN']}
          />
        }
      >
        <Route path="/admin" element={<AdminLayout />}>
      {/* Admin Control Center */}
      <Route element={<RequireAuth allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
        <Route path="/admin" element={<PortalLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminLiveOrders />} />
          <Route path="live-orders" element={<AdminLiveOrders />} />
          <Route path="customers" element={<AdminUsers />} />
          <Route path="live-operations" element={<AdminLiveOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="menu" element={<RestaurantMenu />} />
          <Route path="analytics" element={<AdminDashboard />} />
          <Route path="notifications" element={<AdminSettings />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  );
};
