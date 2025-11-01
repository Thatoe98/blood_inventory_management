'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/StatsCard';
import Toast from '@/components/Toast';
import { fetchInventorySummary, fetchInventoryByHospital } from '@/lib/api';
import type { InventorySummary } from '@/lib/types';

type ToastType = { message: string; type: 'success' | 'error' | 'info' } | null;

interface HospitalInventory {
  hospital_id: string;
  hospital_name: string;
  hospital_phone: string;
  hospital_city: string;
  hospital_address: string;
  total_units: number;
  available_units: number;
  reserved_units: number;
  blood_types: Array<{
    blood_type: string;
    total_units: number;
    available_units: number;
    reserved_units: number;
    expired_units: number;
  }>;
}

export default function InventoryPage() {
  const [summary, setSummary] = useState<InventorySummary[]>([]);
  const [hospitalInventory, setHospitalInventory] = useState<HospitalInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastType>(null);
  const [expandedHospitals, setExpandedHospitals] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, hospitalData] = await Promise.all([
        fetchInventorySummary(),
        fetchInventoryByHospital()
      ]);
      setSummary(summaryData);
      setHospitalInventory(hospitalData);
    } catch (error) {
      setToast({ message: 'Failed to load inventory', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleHospital = (hospitalId: string) => {
    const newExpanded = new Set(expandedHospitals);
    if (newExpanded.has(hospitalId)) {
      newExpanded.delete(hospitalId);
    } else {
      newExpanded.add(hospitalId);
    }
    setExpandedHospitals(newExpanded);
  };

  const getTotalUnits = () => summary.reduce((sum, item) => sum + item.total_units, 0);
  const getAvailableUnits = () => summary.reduce((sum, item) => sum + item.available_units, 0);
  const getReservedUnits = () => summary.reduce((sum, item) => sum + item.reserved_units, 0);
  const getLowStockCount = () => summary.filter(item => item.available_units < item.minimum_threshold).length;

  const getStockLevelClass = (available: number, threshold: number) => {
    if (available < 5) return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', label: 'Critical' };
    if (available < threshold) return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', label: 'Low' };
    return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', label: 'Good' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse">🩸</span>
        </div>
        <div className="text-xl text-gray-600 mt-4 font-medium animate-pulse">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 via-red-50/20 to-blue-50/20 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Blood Inventory by Hospital</h1>
          <p className="text-gray-600 mt-1">View blood stock levels at each hospital</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Units"
          value={getTotalUnits()}
          icon="🩸"
          color="red"
        />
        <StatsCard
          title="Available Units"
          value={getAvailableUnits()}
          icon="✅"
          color="green"
        />
        <StatsCard
          title="Reserved Units"
          value={getReservedUnits()}
          icon="⏳"
          color="yellow"
        />
        <StatsCard
          title="Hospitals"
          value={hospitalInventory.length}
          icon="🏥"
          color="blue"
        />
      </div>

      {/* Overall Blood Type Summary */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Overall Blood Stock</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {summary.map((item) => {
            const stockLevel = getStockLevelClass(item.available_units, item.minimum_threshold);
            return (
              <div
                key={item.blood_type}
                className={`${stockLevel.bg} border-2 ${stockLevel.border} rounded-lg p-3 text-center shadow-sm`}
              >
                <div className={`text-2xl font-bold mb-1 ${stockLevel.text}`}>
                  {item.blood_type}
                </div>
                <div className="text-xl font-semibold text-gray-800">
                  {item.available_units}
                </div>
                <div className="text-xs text-gray-600">units</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hospital Inventory Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Inventory by Hospital</h2>
        {hospitalInventory.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <span className="text-5xl mb-3 block">🏥</span>
            <p className="text-gray-500 text-lg">No hospitals found</p>
          </div>
        ) : (
          hospitalInventory.map((hospital) => {
            const isExpanded = expandedHospitals.has(hospital.hospital_id);
            const hasStock = hospital.total_units > 0;
            
            return (
              <div key={hospital.hospital_id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Hospital Header */}
                <div
                  onClick={() => toggleHospital(hospital.hospital_id)}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b-2 border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                        🏥
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{hospital.hospital_name}</h3>
                        <p className="text-sm text-gray-600">
                          {hospital.hospital_city} • {hospital.hospital_phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{hospital.available_units}</div>
                        <div className="text-xs text-gray-600">Available Units</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-600">{hospital.reserved_units}</div>
                        <div className="text-xs text-gray-600">Reserved</div>
                      </div>
                      <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blood Type Breakdown */}
                {isExpanded && (
                  <div className="p-4 bg-gray-50">
                    {!hasStock ? (
                      <p className="text-gray-500 text-center py-4">No blood stock at this hospital</p>
                    ) : (
                      <>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Blood Type Breakdown</h4>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                          {hospital.blood_types.map((bloodType) => {
                            if (bloodType.total_units === 0) return null;
                            
                            return (
                              <div
                                key={bloodType.blood_type}
                                className="bg-white border-2 border-gray-200 rounded-lg p-3 text-center"
                              >
                                <div className="text-xl font-bold text-gray-800 mb-1">
                                  {bloodType.blood_type}
                                </div>
                                <div className="space-y-1">
                                  <div>
                                    <div className="text-lg font-semibold text-green-600">
                                      {bloodType.available_units}
                                    </div>
                                    <div className="text-xs text-gray-500">available</div>
                                  </div>
                                  {bloodType.reserved_units > 0 && (
                                    <div className="text-xs text-yellow-600">
                                      {bloodType.reserved_units} reserved
                                    </div>
                                  )}
                                  {bloodType.expired_units > 0 && (
                                    <div className="text-xs text-red-600">
                                      {bloodType.expired_units} expired
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
