'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface InventoryItem {
  inventory_id: string;
  hospital_id: string;
  number_of_units: number;
  expiry_ts: string;
  status: string;
  blood_type: string;
  hospital_name: string;
  hospital_city: string;
  hospital_phone: string;
}

export default function AllInventoryPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hospitalId, setHospitalId] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState<string>('all');

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
      fetchAllInventory();
    }
  }, [router]);

  const fetchAllInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          inventory_id,
          hospital_id,
          number_of_units,
          expiry_ts,
          status,
          donations!inner (
            donors!inner (
              abo_group,
              rh_factor
            )
          ),
          hospitals!inner (
            name,
            city,
            phone
          )
        `)
        .eq('status', 'Available')
        .gte('expiry_ts', new Date().toISOString())
        .order('expiry_ts', { ascending: false });

      if (error) throw error;

      const formatted = data?.map((item: any) => ({
        inventory_id: item.inventory_id,
        hospital_id: item.hospital_id,
        number_of_units: item.number_of_units,
        expiry_ts: item.expiry_ts,
        status: item.status,
        blood_type: `${item.donations.donors.abo_group}${item.donations.donors.rh_factor}`,
        hospital_name: item.hospitals.name,
        hospital_city: item.hospitals.city,
        hospital_phone: item.hospitals.phone,
      })) || [];

      setInventory(formatted);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExpiryDays = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Group inventory by hospital and blood type
  const groupedInventory = inventory.reduce((acc, item) => {
    if (selectedBloodType !== 'all' && item.blood_type !== selectedBloodType) {
      return acc;
    }

    if (!acc[item.hospital_id]) {
      acc[item.hospital_id] = {
        hospital_name: item.hospital_name,
        hospital_city: item.hospital_city,
        hospital_phone: item.hospital_phone,
        blood_types: {} as Record<string, number>,
        total_units: 0,
      };
    }

    if (!acc[item.hospital_id].blood_types[item.blood_type]) {
      acc[item.hospital_id].blood_types[item.blood_type] = 0;
    }

    acc[item.hospital_id].blood_types[item.blood_type] += item.number_of_units;
    acc[item.hospital_id].total_units += item.number_of_units;

    return acc;
  }, {} as Record<string, any>);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
                <span className="text-xl">🏥</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">All Hospitals Inventory</h1>
                <p className="text-purple-100 text-xs md:text-sm">View available blood from other hospitals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Info Banner */}
        <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Blood Transfer Information</h3>
              <p className="text-sm text-blue-800">
                Contact other hospitals directly using the phone numbers provided to request blood transfers. 
                All units shown are available and not expired.
              </p>
            </div>
          </div>
        </div>

        {/* Blood Type Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Blood Type</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBloodType('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedBloodType === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Types
            </button>
            {bloodTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedBloodType(type)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedBloodType === type
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Hospitals List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading inventory data...</p>
          </div>
        ) : Object.keys(groupedInventory).length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-gray-600 mb-2">No inventory found</p>
            {selectedBloodType !== 'all' && (
              <p className="text-sm text-gray-500">Try selecting a different blood type</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(groupedInventory).map(([hosId, data]: [string, any]) => (
              <div key={hosId} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
                {/* Hospital Header */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{data.hospital_name}</h3>
                      <p className="text-sm opacity-90 flex items-center gap-1">
                        <span>📍</span> {data.hospital_city}
                      </p>
                      <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
                        <span>📞</span> {data.hospital_phone}
                      </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="text-2xl font-bold">{data.total_units}</div>
                      <div className="text-xs opacity-90">units</div>
                    </div>
                  </div>
                </div>

                {/* Blood Type Inventory */}
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Available Blood Types</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {bloodTypes.map(type => {
                      const units = data.blood_types[type] || 0;
                      return (
                        <div 
                          key={type} 
                          className={`text-center rounded-lg p-3 border-2 ${
                            units > 0 
                              ? 'bg-red-50 border-red-200' 
                              : 'bg-gray-50 border-gray-200 opacity-50'
                          }`}
                        >
                          <div className="text-xs font-semibold text-gray-700 mb-1">{type}</div>
                          <div className={`text-xl font-bold ${units > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {units}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Contact Button */}
                <div className="p-4 bg-gray-50 border-t">
                  <a
                    href={`tel:${data.hospital_phone}`}
                    className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    📞 Contact for Transfer
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
