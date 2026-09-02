import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Notification } from '../types/index.js';
import { notificationService } from '../services/notificationService.js';
import { useAuth } from './AuthContext.js';
import { useSocket } from './SocketContext.js';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  toasts: ToastMessage[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  dismissToast: (id: string) => void;
  showToast: (title: string, message: string, type?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const data = await notificationService.list();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const showToast = useCallback((title: string, message: string, type?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [newToast, ...prev].slice(0, 4));

    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Socket listener for new in-app notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      setNotifications((prev) => [
        {
          id: data.id,
          userId: '',
          title: data.title,
          message: data.message,
          type: data.type,
          dataJson: data.dataJson,
          isRead: false,
          createdAt: data.createdAt,
        },
        ...prev,
      ]);
      setUnreadCount((count) => count + 1);
      showToast(data.title, data.message, data.type);
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, showToast]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.warn('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        markAsRead,
        markAllAsRead,
        refreshNotifications,
        dismissToast,
        showToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
