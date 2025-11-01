'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MenuPage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  const viewItems = [
    { name: 'Dashboard', icon: '📊', href: '/dashboard', color: 'from-blue-500 to-blue-600' },
    { name: 'Donors', icon: '👥', href: '/donors', color: 'from-green-500 to-green-600' },
    { name: 'Donations', icon: '💉', href: '/donations', color: 'from-red-500 to-red-600' },
    { name: 'Inventory', icon: '🩸', href: '/inventory', color: 'from-pink-500 to-pink-600' },
    { name: 'Hospitals', icon: '🏥', href: '/hospitals', color: 'from-purple-500 to-purple-600' },
    { name: 'Campaigns', icon: '📢', href: '/campaigns', color: 'from-orange-500 to-orange-600' },
    { name: 'Patients', icon: '🤒', href: '/patients', color: 'from-yellow-500 to-yellow-600' },
  ];

  const actionItems = [
    { name: 'Add Donor', icon: '➕👥', href: '/donors?action=add', color: 'from-green-500 to-green-600' },
    { name: 'Add Donation', icon: '➕💉', href: '/donations?action=add', color: 'from-red-500 to-red-600' },
    { name: 'Add Hospital', icon: '➕🏥', href: '/hospitals?action=add', color: 'from-purple-500 to-purple-600' },
    { name: 'Add Patient', icon: '➕🤒', href: '/patients?action=add', color: 'from-yellow-500 to-yellow-600' },
    { name: 'Add Campaign', icon: '➕📢', href: '/campaigns?action=add', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-red-50/20 to-blue-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-pink-500 text-white py-4 px-4 md:px-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-xl md:text-2xl">🩸</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Blood Bank System</h1>
                <p className="text-red-100 text-xs md:text-sm">Main Menu - Admin Portal</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 md:px-4 md:py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg font-semibold transition-all duration-300 flex items-center gap-1 md:gap-2 border border-white/30 text-xs md:text-sm"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-3 md:p-4">
        {/* Welcome Message */}
        <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 mb-3 md:mb-4 border-l-4 border-red-500">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-lg md:text-xl">👋</span>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Welcome, Administrator!</h2>
              <p className="text-gray-600 text-xs md:text-sm">Choose an option below to manage the blood bank system</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          {/* View Section */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 h-full">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-gray-200">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-base md:text-lg">👁️</span>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-800">View</h3>
                  <p className="text-xs text-gray-600">Browse existing records</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {viewItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group relative bg-gradient-to-r from-gray-50 to-white p-2 rounded-lg border-2 border-gray-200 hover:border-transparent hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col items-center justify-center"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="relative flex flex-col items-center">
                      <div className={`w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center text-sm md:text-base shadow-sm group-hover:scale-110 transition-transform duration-300 mb-1`}>
                        {item.icon}
                      </div>
                      <h4 className="font-semibold text-xs text-gray-800 group-hover:text-gray-900 text-center">{item.name}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 h-full">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-gray-200">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-base md:text-lg">⚡</span>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-800">Quick Actions</h3>
                  <p className="text-xs text-gray-600">Add new records quickly</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {actionItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group relative bg-gradient-to-r from-gray-50 to-white p-2 rounded-lg border-2 border-gray-200 hover:border-transparent hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col items-center justify-center"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="relative flex flex-col items-center">
                      <div className={`w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center text-xs md:text-sm shadow-sm group-hover:scale-110 transition-transform duration-300 mb-1`}>
                        {item.icon}
                      </div>
                      <h4 className="font-semibold text-xs text-gray-800 group-hover:text-gray-900 text-center">{item.name}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
