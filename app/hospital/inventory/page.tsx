'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface InventoryItem {
  inventory_id: string;
  donation_id: string;
  hospital_id: string;
  number_of_units: number;
  collection_ts: string;
  expiry_ts: string;
  status: string;
  notes: string | null;
  donor_name: string;
  blood_type: string;
  hospital_name: string;
}

export default function HospitalInventoryPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hospitalId, setHospitalId] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'expiring'>('available');

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isAuthenticated');
      const userInfo = localStorage.getItem('bloodbank_user');
      
      if (!isAuth || !userInfo) {
        router.push('/login');
        return null;
      }

      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.role !== 'hospital') {
          router.push('/menu');
          return null;
        }
        return parsed;
      } catch (error) {
        console.error('Error parsing user info:', error);
        router.push('/login');
        return null;
      }
    };

    const userInfo = checkAuth();
    if (userInfo) {
      setHospitalId(userInfo.hospitalId);
      setHospitalName(userInfo.hospitalName);
      fetchInventory(userInfo.hospitalId);
    }
  }, [router]);

  const fetchInventory = async (hosId: string) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          donations!inner (
            donation_id,
            donors!inner (
              first_name,
              last_name,
              abo_group,
              rh_factor
            )
          ),
          hospitals!inner (
            name
          )
        `)
        .eq('hospital_id', hosId)
        .order('expiry_ts', { ascending: true });

      if (error) throw error;

      const formatted = data?.map((item: any) => ({
        inventory_id: item.inventory_id,
        donation_id: item.donation_id,
        hospital_id: item.hospital_id,
        number_of_units: item.number_of_units,
        collection_ts: item.collection_ts,
        expiry_ts: item.expiry_ts,
        status: item.status,
        notes: item.notes,
        donor_name: `${item.donations.donors.first_name} ${item.donations.donors.last_name}`,
        blood_type: `${item.donations.donors.abo_group}${item.donations.donors.rh_factor}`,
        hospital_name: item.hospitals.name,
      })) || [];

      setInventory(formatted);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return { status: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800 border-red-300' };
    if (daysUntilExpiry <= 7) return { status: 'expiring', label: `${daysUntilExpiry}d left`, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { status: 'valid', label: `${daysUntilExpiry}d left`, color: 'bg-green-100 text-green-800 border-green-300' };
  };

  const filteredInventory = inventory.filter(item => {
    if (filter === 'available') return item.status === 'Available';
    if (filter === 'expiring') {
      const expiryStatus = getExpiryStatus(item.expiry_ts);
      return expiryStatus.status === 'expiring' && item.status === 'Available';
    }
    return true;
  });

  const bloodTypeCount = filteredInventory.reduce((acc, item) => {
    if (item.status === 'Available') {
      acc[item.blood_type] = (acc[item.blood_type] || 0) + item.number_of_units;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-50/20 to-blue-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 text-white py-4 px-4 md:px-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/hospital/dashboard"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <span className="text-xl">←</span>
              </Link>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-xl">🩸</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">My Inventory</h1>
                <p className="text-purple-100 text-xs md:text-sm">{hospitalName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="text-2xl mb-2">🩸</div>
            <div className="text-2xl font-bold text-gray-800">{inventory.filter(i => i.status === 'Available').length}</div>
            <div className="text-sm text-gray-600">Available Units</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="text-2xl font-bold text-yellow-600">
              {inventory.filter(i => getExpiryStatus(i.expiry_ts).status === 'expiring' && i.status === 'Available').length}
            </div>
            <div className="text-sm text-gray-600">Expiring Soon</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="text-2xl mb-2">📋</div>
            <div className="text-2xl font-bold text-gray-800">{Object.keys(bloodTypeCount).length}</div>
            <div className="text-sm text-gray-600">Blood Types</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">
              {inventory.filter(i => i.status === 'Available' && getExpiryStatus(i.expiry_ts).status === 'valid').length}
            </div>
            <div className="text-sm text-gray-600">Fresh Stock</div>
          </div>
        </div>

        {/* Blood Type Summary */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Available by Blood Type</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
              <div key={type} className="text-center">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-lg p-3 mb-2">
                  <div className="text-xs font-semibold">{type}</div>
                  <div className="text-2xl font-bold">{bloodTypeCount[type] || 0}</div>
                </div>
                <div className="text-xs text-gray-600">units</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('available')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'available'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Available ({inventory.filter(i => i.status === 'Available').length})
            </button>
            <button
              onClick={() => setFilter('expiring')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'expiring'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Expiring Soon ({inventory.filter(i => getExpiryStatus(i.expiry_ts).status === 'expiring' && i.status === 'Available').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({inventory.length})
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading inventory...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-6xl mb-4 block">📦</span>
              <p className="text-gray-600">No inventory items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Blood Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Donor</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Units</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Collection Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Expiry</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInventory.map((item) => {
                    const expiryInfo = getExpiryStatus(item.expiry_ts);
                    return (
                      <tr key={item.inventory_id} className="hover:bg-purple-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                            {item.blood_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">{item.donor_name}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">{item.number_of_units}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(item.collection_ts).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${expiryInfo.color}`}>
                            {expiryInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'Available' ? 'bg-green-100 text-green-800' : 
                            item.status === 'Reserved' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
