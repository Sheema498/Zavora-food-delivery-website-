import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { SocketProvider } from './context/SocketContext.js';
import { CartProvider } from './context/CartContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { AppRoutes } from './routes/AppRoutes.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
