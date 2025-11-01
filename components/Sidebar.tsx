'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
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

  return (
    <aside className="bg-gradient-to-b from-red-700 via-red-600 to-red-700 text-white w-64 h-screen flex flex-col shadow-2xl overflow-hidden">
      {/* Header with animated blood drop - Fixed at top */}
      <div className="p-6 pb-4 flex-shrink-0">
        <div className="relative">
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
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-1 scrollbar-thin scrollbar-thumb-red-500 scrollbar-track-red-800/20">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
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
