'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export default function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/menu', label: 'Main Menu', icon: '🏠' },
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/donors', label: 'Donors', icon: '👥' },
    { href: '/donations', label: 'Donations', icon: '💉' },
    { href: '/inventory', label: 'Inventory', icon: '🩸' },
    { href: '/hospitals', label: 'Hospitals', icon: '🏥' },
    { href: '/campaigns', label: 'Campaigns', icon: '📢' },
    { href: '/patients', label: 'Patients', icon: '🤒' },
  ];

  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  return (
    <aside 
      className={`bg-gradient-to-b from-red-700 via-red-600 to-red-700 text-white w-64 h-screen flex flex-col shadow-2xl overflow-hidden fixed z-40 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header with animated blood drop - Fixed at top */}
      <div className="p-6 pb-4 flex-shrink-0">
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="absolute -top-2 -left-2 w-20 h-20 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
            <h1 className="text-2xl font-bold flex items-center gap-2 relative">
              <span className="text-3xl animate-blood-drop">🩸</span>
              <span className="bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                Blood Bank
              </span>
            </h1>
            <p className="text-red-100/80 text-sm mt-1 font-medium">Inventory Management System</p>
            <div className="h-1 w-16 bg-gradient-to-r from-white/50 to-transparent rounded-full mt-2"></div>
          </div>
          
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-1 scrollbar-thin scrollbar-thumb-red-500 scrollbar-track-red-800/20">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? 'bg-white/20 text-white font-semibold shadow-lg backdrop-blur-sm'
                  : 'text-red-50 hover:bg-white/10 hover:translate-x-1'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white via-red-100 to-white rounded-r-full animate-pulse"></div>
              )}
              
              {/* Icon with hover animation */}
              <span className={`text-2xl transition-transform duration-300 ${
                isActive ? 'scale-110' : 'group-hover:scale-125 group-hover:rotate-12'
              }`}>
                {item.icon}
              </span>
              
              {/* Label */}
              <span className="font-medium">{item.label}</span>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
