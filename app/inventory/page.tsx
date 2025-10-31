'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/StatsCard';
import Toast from '@/components/Toast';
import { fetchInventorySummary } from '@/lib/api';
import type { InventorySummary } from '@/lib/types';

type ToastType = { message: string; type: 'success' | 'error' | 'info' } | null;

export default function InventoryPage() {
  const [summary, setSummary] = useState<InventorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastType>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const summaryData = await fetchInventorySummary();
      setSummary(summaryData);
    } catch (error) {
      setToast({ message: 'Failed to load inventory', type: 'error' });
    } finally {
      setLoading(false);
    }
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Blood Inventory</h1>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          title="Low Stock Types"
          value={getLowStockCount()}
          icon="⚠️"
          color="orange"
        />
      </div>

      {/* Blood Type Summary Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Blood Stock by Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {summary.map((item) => {
            const stockLevel = getStockLevelClass(item.available_units, item.minimum_threshold);
            return (
              <div
                key={item.blood_type}
                className={`${stockLevel.bg} border-2 ${stockLevel.border} rounded-lg p-4 text-center shadow-sm`}
              >
                <div className={`text-3xl font-bold mb-1 ${stockLevel.text}`}>
                  {item.blood_type}
                </div>
                <div className="text-2xl font-semibold text-gray-800">
                  {item.available_units}
                </div>
                <div className="text-xs text-gray-600 mb-1">available</div>
                <div className="text-xs text-gray-500">
                  Total: {item.total_units} | Reserved: {item.reserved_units}
                </div>
                <div className={`text-xs font-semibold mt-2 ${stockLevel.text}`}>
                  {stockLevel.label} Stock
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Stock Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Stock Status</h3>
          <div className="space-y-3">
            {summary.map((item) => {
              const stockLevel = getStockLevelClass(item.available_units, item.minimum_threshold);
              const percentage = (item.available_units / item.minimum_threshold) * 100;
              
              return (
                <div key={item.blood_type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-700">{item.blood_type}</span>
                    <span className={`text-sm font-medium ${stockLevel.text}`}>
                      {item.available_units}/{item.minimum_threshold} units
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stockLevel.label === 'Critical'
                          ? 'bg-red-500'
                          : stockLevel.label === 'Low'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Inventory Alerts</h3>
          <div className="space-y-3">
            {summary
              .filter(item => item.available_units < item.minimum_threshold)
              .map((item) => (
                <div
                  key={item.blood_type}
                  className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded"
                >
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="font-semibold text-red-700">
                      Blood Type {item.blood_type} - Low Stock
                    </p>
                    <p className="text-sm text-red-600">
                      Only {item.available_units} units available (minimum: {item.minimum_threshold})
                    </p>
                  </div>
                </div>
              ))}
            {summary.filter(item => item.available_units < item.minimum_threshold).length === 0 && (
              <div className="flex items-center justify-center gap-3 p-6 bg-green-50 border border-green-200 rounded">
                <span className="text-3xl">✅</span>
                <div className="text-center">
                  <p className="font-semibold text-green-700">All Blood Types in Stock</p>
                  <p className="text-sm text-green-600">No critical alerts at this time</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
