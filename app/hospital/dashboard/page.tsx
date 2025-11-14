'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HospitalDashboard() {
  const router = useRouter();
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalId, setHospitalId] = useState('');

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem('isAuthenticated');
    const userInfo = localStorage.getItem('bloodbank_user');
    
    if (!isAuth || !userInfo) {
      router.push('/login');
      return;
    }

    try {
      const parsed = JSON.parse(userInfo);
      if (parsed.role !== 'hospital') {
        router.push('/menu'); // Redirect admin to admin menu
        return;
      }
      setHospitalName(parsed.hospitalName || 'Hospital User');
      setHospitalId(parsed.hospitalId || '');
    } catch (error) {
      console.error('Error parsing user info:', error);
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('bloodbank_auth');
    localStorage.removeItem('bloodbank_user');
    localStorage.removeItem('hospital_name');
    router.push('/login');
  };

  const menuItems = [
    { 
      name: 'My Inventory', 
      icon: '🩸', 
      href: '/hospital/inventory', 
      color: 'from-red-500 to-pink-600',
      description: 'View your hospital\'s blood inventory'
    },
    { 
      name: 'All Inventory', 
      icon: '🏥', 
      href: '/hospital/all-inventory', 
      color: 'from-purple-500 to-purple-600',
      description: 'View inventory from other hospitals'
    },
    { 
      name: 'Add Donor', 
      icon: '➕👥', 
      href: '/hospital/donors', 
      color: 'from-green-500 to-green-600',
      description: 'Register new blood donors'
    },
    { 
      name: 'Add Donation', 
      icon: '➕💉', 
      href: '/hospital/donations', 
      color: 'from-red-500 to-red-600',
      description: 'Record new blood donations'
    },
    { 
      name: 'Add Campaign', 
      icon: '➕📢', 
      href: '/hospital/campaigns', 
      color: 'from-orange-500 to-orange-600',
      description: 'Create donation campaigns'
    },
    { 
      name: 'Add Patient', 
      icon: '➕🤒', 
      href: '/hospital/patients', 
      color: 'from-yellow-500 to-yellow-600',
      description: 'Register new patients'
    },
    { 
      name: 'View Patients', 
      icon: '📋', 
      href: '/hospital/view-patients', 
      color: 'from-blue-500 to-blue-600',
      description: 'View all registered patients'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-50/20 to-blue-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 text-white py-4 px-4 md:px-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-xl md:text-2xl">🏥</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{hospitalName}</h1>
                <p className="text-purple-100 text-xs md:text-sm">Hospital Portal</p>
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
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-4 border-l-4 border-purple-500">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-lg md:text-xl">👋</span>
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-800">Welcome to Hospital Portal</h2>
              <p className="text-gray-600 text-xs md:text-sm">Manage your hospital's blood inventory and records</p>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-105"
            >
              <div className={`h-1.5 bg-gradient-to-r ${item.color}`}></div>
              <div className="p-3 md:p-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  {item.icon}
                </div>
                <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-gray-600 text-xs leading-tight">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Cards */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="text-xs font-semibold opacity-90">Quick Tip</p>
                <p className="text-xs mt-0.5">Add donations and manage inventory efficiently</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              <div>
                <p className="text-xs font-semibold opacity-90">Transfer</p>
                <p className="text-xs mt-0.5">View other hospitals' inventory for transfers</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-xs font-semibold opacity-90">Reports</p>
                <p className="text-xs mt-0.5">Track your donations and campaigns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
