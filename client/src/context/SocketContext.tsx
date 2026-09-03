import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext.js';
import { sounds } from '../utils/audio.js';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinOrderRoom: (orderId: string) => void;
  leaveOrderRoom: (orderId: string) => void;
  emitDriverLocation: (data: {
    orderId?: string;
    deliveryBoyId?: string;
    deliveryPartnerId?: string;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  }) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Connect to server Socket.IO gateway
    const newSocket = io(window.location.origin, {
      auth: {
        token: token || undefined,
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Sound effect triggers on key socket events
    newSocket.on('order:created', () => {
      if (
        user?.role === 'RESTAURANT_MANAGER' ||
        user?.role === 'RESTAURANT' ||
        user?.role === 'SUPER_ADMIN' ||
        user?.role === 'ADMIN'
      ) {
        sounds.playOrderAlert();
      }
    });

    newSocket.on('delivery:assigned', () => {
      if (user?.role === 'DELIVERY_BOY' || user?.role === 'DELIVERY_PARTNER') {
        sounds.playOrderAlert();
      }
    });

    newSocket.on('notification:new', () => {
      sounds.playChime();
    });

    newSocket.on('order:delivered', () => {
      sounds.playSuccess();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  const joinOrderRoom = (orderId: string) => {
    if (socket && isConnected) {
      socket.emit('join:order', { orderId });
    }
  };

  const leaveOrderRoom = (orderId: string) => {
    if (socket && isConnected) {
      socket.emit('leave:order', { orderId });
    }
  };

  const emitDriverLocation = (data: {
    orderId?: string;
    deliveryBoyId?: string;
    deliveryPartnerId?: string;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  }) => {
    if (socket && isConnected) {
      socket.emit('driver:location-update', {
        ...data,
        deliveryBoyId: data.deliveryBoyId || data.deliveryPartnerId,
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinOrderRoom,
        leaveOrderRoom,
        emitDriverLocation,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
