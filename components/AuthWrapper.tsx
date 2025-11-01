'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Closed by default for mobile
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    // Check if mobile on mount and window resize
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true); // Auto-open on desktop
      } else {
        setIsSidebarOpen(false); // Auto-close on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isMobile={isMobile} />
        
        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto flex flex-col transition-all duration-300 ${
          isSidebarOpen && !isMobile ? 'lg:ml-64' : 'ml-0'
        }`}>
          {/* Mobile Header with Toggle */}
          <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-20">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-800">Blood Bank System</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className={`hidden lg:block fixed top-4 z-50 p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-300 shadow-lg ${
              isSidebarOpen ? 'left-[260px]' : 'left-4'
            }`}
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Page Content */}
          <div className="flex-1 p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return null;
}
