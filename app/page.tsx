'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/StatsCard';
import Table from '@/components/Table';
import { getDashboardStats, fetchInventorySummary, fetchDonors, fetchDonations } from '@/lib/api';
import type { DashboardStats, InventorySummary, Donor, Donation } from '@/lib/types';
import { formatDateReadable } from '@/lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inventory, setInventory] = useState<InventorySummary[]>([]);
  const [recentDonors, setRecentDonors] = useState<Donor[]>([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsData, inventoryData, donorsData, donationsData] = await Promise.all([
        getDashboardStats(),
        fetchInventorySummary(),
        fetchDonors(),
        fetchDonations(),
      ]);

      setStats(statsData);
      setInventory(inventoryData);
      setRecentDonors(donorsData.slice(0, 5));
      setRecentDonations(donationsData.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse">🩸</span>
        </div>
        <div className="text-xl text-gray-600 mt-4 font-medium animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 via-red-50/20 to-blue-50/20 min-h-full">
      {/* Header with animated background */}
      <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-pink-500 text-white py-8 px-6 shadow-xl overflow-hidden mb-8 -mx-8 -mt-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
            <span className="text-5xl animate-blood-drop">🩸</span>
            Blood Bank Dashboard
          </h1>
          <p className="text-red-100 text-lg">Real-time inventory management system</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <StatsCard
            title="Total Donors"
            value={stats?.totalDonors ?? 0}
            icon="👥"
            color="blue"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <StatsCard
            title="Eligible Donors"
            value={stats?.eligibleDonors ?? 0}
            icon="✓"
            color="green"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <StatsCard
            title="Total Donations"
            value={stats?.totalDonations ?? 0}
            icon="💉"
            color="red"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <StatsCard
            title="Available Units"
            value={stats?.availableUnits ?? 0}
            icon="🩸"
            color="purple"
          />
        </div>
      </div>

      {/* Blood Inventory Summary */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">🩸</span>
          Blood Inventory
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {inventory.map((item) => (
            <div
              key={item.blood_type}
              className="group relative bg-white border-2 border-red-200 hover:border-red-400 rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative">
                <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-1">
                  {item.blood_type}
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1 group-hover:scale-110 transition-transform duration-300">
                  {item.total_units}
                </div>
                <div className="text-sm text-gray-600 font-medium">units</div>
              </div>
              
              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Donors */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">👥</span>
          Recent Donors
        </h2>
        <Table
          columns={[
            { 
              key: 'full_name', 
              label: 'Name',
              render: (donor: any) => donor.full_name || `${donor.first_name} ${donor.last_name}`
            },
            { key: 'blood_type', label: 'Blood Type' },
            { key: 'phone_number', label: 'Phone' },
            { key: 'email', label: 'Email' },
            {
              key: 'eligibility_status',
              label: 'Status',
              render: (donor: any) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    donor.eligibility_status === 'Eligible'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                  }`}
                >
                  {donor.eligibility_status}
                </span>
              ),
            },
          ]}
          data={recentDonors.map(donor => ({ ...donor, id: donor.donor_id }))}
          emptyMessage="No donors found"
        />
      </div>

      {/* Recent Donations */}
      <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">💉</span>
          Recent Donations
        </h2>
        <Table
          columns={[
            {
              key: 'donation_timestamp',
              label: 'Date',
              render: (donation: any) => formatDateReadable(donation.donation_timestamp),
            },
            { key: 'donor_name', label: 'Donor' },
            { key: 'blood_type', label: 'Blood Type' },
            { key: 'hospital_name', label: 'Hospital' },
            { 
              key: 'quantity_ml', 
              label: 'Quantity (ml)',
              render: (donation: any) => `${donation.quantity_ml || 0} ml`
            },
            {
              key: 'test_result',
              label: 'Test Result',
              render: (donation: any) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    donation.test_result === 'Accepted'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : donation.test_result === 'Rejected'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                  }`}
                >
                  {donation.test_result}
                </span>
              ),
            },
          ]}
          data={recentDonations.map(donation => ({ ...donation, id: donation.donation_id }))}
          emptyMessage="No donations found"
        />
      </div>
    </div>
  );
}
