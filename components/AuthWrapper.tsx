'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated');
      const isAuth = auth === 'true';
      setIsAuthenticated(isAuth);
      setIsLoading(false);

      // Redirect logic
      if (!isAuth && !isPublicPath) {
        router.push('/login');
      } else if (isAuth && pathname === '/login') {
        router.push('/menu');
      }
    };

    checkAuth();
  }, [pathname, isPublicPath, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-600 to-pink-600">
        <div className="text-white text-xl flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Show public pages without sidebar
  if (isPublicPath || pathname === '/menu') {
    return <>{children}</>;
  }

  // Show authenticated pages with sidebar
  if (isAuthenticated) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    );
  }

  return null;
}
