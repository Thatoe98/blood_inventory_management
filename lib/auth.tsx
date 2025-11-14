'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'admin' | 'hospital';

export interface UserInfo {
  role: UserRole;
  hospitalId?: string;
  hospitalName?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (password: string, role: UserRole, hospitalId?: string) => boolean;
  logout: () => void;
  isAdmin: () => boolean;
  isHospital: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const auth = localStorage.getItem('bloodbank_auth');
    const storedUserInfo = localStorage.getItem('bloodbank_user');
    
    if (auth === 'true' && storedUserInfo) {
      try {
        const parsed = JSON.parse(storedUserInfo);
        setIsAuthenticated(true);
        setUserInfo(parsed);
      } catch (error) {
        console.error('Error parsing user info:', error);
        localStorage.removeItem('bloodbank_auth');
        localStorage.removeItem('bloodbank_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (password: string, role: UserRole, hospitalId?: string): boolean => {
    if (role === 'admin' && password === 'thatoe') {
      const user: UserInfo = { role: 'admin' };
      setIsAuthenticated(true);
      setUserInfo(user);
      localStorage.setItem('bloodbank_auth', 'true');
      localStorage.setItem('bloodbank_user', JSON.stringify(user));
      return true;
    }
    
    if (role === 'hospital' && hospitalId) {
      // For hospital login, password is the passkey
      // We'll validate this on the login page by fetching hospital data
      const user: UserInfo = { 
        role: 'hospital', 
        hospitalId,
        hospitalName: localStorage.getItem('hospital_name') || 'Hospital User'
      };
      setIsAuthenticated(true);
      setUserInfo(user);
      localStorage.setItem('bloodbank_auth', 'true');
      localStorage.setItem('bloodbank_user', JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    localStorage.removeItem('bloodbank_auth');
    localStorage.removeItem('bloodbank_user');
    localStorage.removeItem('hospital_name');
  };

  const isAdmin = () => userInfo?.role === 'admin';
  const isHospital = () => userInfo?.role === 'hospital';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-600 to-pink-600">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userInfo, login, logout, isAdmin, isHospital }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
