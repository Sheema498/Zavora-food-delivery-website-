import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types/index.js';
import { authService, AuthResponse } from '../services/authService.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: Record<string, unknown>) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  quickDemoLogin: (role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('quickbite_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('quickbite_auth_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('quickbite_auth_token');
      if (storedToken) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
          localStorage.setItem('quickbite_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await authService.login(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('quickbite_auth_token', res.token);
    localStorage.setItem('quickbite_user', JSON.stringify(res.user));
    return res;
  };

  const register = async (data: Record<string, unknown>): Promise<AuthResponse> => {
    const res = await authService.register(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('quickbite_auth_token', res.token);
    localStorage.setItem('quickbite_user', JSON.stringify(res.user));
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('quickbite_auth_token');
    localStorage.removeItem('quickbite_user');
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updatedFields };
      setUser(updated);
      localStorage.setItem('quickbite_user', JSON.stringify(updated));
    }
  };

  const quickDemoLogin = async (role: Role): Promise<void> => {
    let email = 'customer@example.com';
    if (role === 'RESTAURANT') email = 'owner@pizzahub.com';
    else if (role === 'DELIVERY_PARTNER') email = 'arjun.driver@quickbite.com';
    else if (role === 'ADMIN') email = 'admin@quickbite.com';

    await login(email, 'Password123!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
