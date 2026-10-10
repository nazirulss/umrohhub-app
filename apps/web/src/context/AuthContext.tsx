'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, LoginPayload, RegisterPayload, UserRole } from '@/types/auth';
import { DEMO_USERS } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  quickLogin: (role: 'CUSTOMER' | 'TRAVEL' | 'SUPER_ADMIN') => Promise<void>;
  isAuthModalOpen: boolean;
  authModalDefaultRole: UserRole;
  openAuthModal: (defaultRole?: UserRole) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default demo user: Jamaah Aktif agar preview interaktif langsung hidup
  const [user, setUser] = useState<AuthUser | null>(DEMO_USERS['jamaah@umrohhub.com']);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalDefaultRole, setAuthModalDefaultRole] = useState<UserRole>('CUSTOMER');

  // Cek cookie session saat pertama kali mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // Tetap menggunakan user awal
      });
  }, []);

  const openAuthModal = (defaultRole: UserRole = 'CUSTOMER') => {
    setAuthModalDefaultRole(defaultRole);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (payload: LoginPayload): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        closeAuthModal();
        return { success: true };
      }
      return { success: false, message: data.message || 'Login gagal' };
    } catch {
      // Fallback offline
      const demo = DEMO_USERS[payload.email.toLowerCase()];
      if (demo) {
        setUser(demo);
        closeAuthModal();
        return { success: true };
      }
      return { success: false, message: 'Server tidak terjangkau' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        closeAuthModal();
        return { success: true };
      }
      return { success: false, message: data.message || 'Registrasi gagal' };
    } catch {
      return { success: false, message: 'Server tidak terjangkau' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    setUser(null);
  };

  // 1-Click Quick Demo Login untuk pengujian cepat 3 portal berbeda
  const quickLogin = async (role: 'CUSTOMER' | 'TRAVEL' | 'SUPER_ADMIN') => {
    let email = 'jamaah@umrohhub.com';
    let password = 'jamaah123';
    if (role === 'TRAVEL') {
      email = 'biro@almadinah.com';
      password = 'biro123';
    } else if (role === 'SUPER_ADMIN') {
      email = 'admin@kemenag-hub.id';
      password = 'admin123';
    }

    await login({ email, password, roleHint: role });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
        isAuthModalOpen,
        authModalDefaultRole,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
