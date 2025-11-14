'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatsCard from '@/components/StatsCard';
import { fetchDonors, fetchHospitals, fetchDonations, fetchPatients, fetchCampaigns, fetchInventorySummary } from '@/lib/api';
import type { Donor, Donation, InventorySummary } from '@/lib/types';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    donors: 0,
    eligibleDonors: 0,
    donations: 0,
    hospitals: 0,
    patients: 0,
    campaigns: 0,
    totalBloodUnits: 0
  });
  const [donors, setDonors] = useState<Donor[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [inventory, setInventory] = useState<InventorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donorsData, hospitalsData, donationsData, patientsData, campaignsData, inventoryData] = await Promise.all([
        fetchDonors(),
        fetchHospitals(),
        fetchDonations(),
        fetchPatients(),
        fetchCampaigns(),
        fetchInventorySummary(),
      ]);
      
      // Calculate eligible donors (last donation more than 58 days ago or never donated)
      const now = new Date();
      const eligibleDonors = donorsData.filter(donor => {
        if (!donor.last_donation_date) return true; // Never donated = eligible
        const lastDonation = new Date(donor.last_donation_date);
        const daysSince = Math.floor((now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince > 58;
      });
      
      // Filter upcoming campaigns (start_date is today or in the future)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const upcomingCampaigns = campaignsData.filter(campaign => {
        const startDate = new Date(campaign.start_date);
        startDate.setHours(0, 0, 0, 0);
        return startDate >= today;
      });
      
      // Calculate total blood units from inventory
      const totalBloodUnits = inventoryData.reduce((sum, item) => sum + item.available_units, 0);
      
      setStats({
        donors: donorsData.length,
        eligibleDonors: eligibleDonors.length,
        donations: donationsData.length,
        hospitals: hospitalsData.length,
        patients: patientsData.length,
        campaigns: upcomingCampaigns.length,
        totalBloodUnits: totalBloodUnits
      });
      setDonors(donorsData);
      setDonations(donationsData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLowStockAlerts = () => {
    return inventory.filter(item => item.available_units < item.minimum_threshold);
  };

  const getRecentDonors = () => {
    return donors.slice(0, 5);
  };

  const getRecentDonations = () => {
    return donations.slice(0, 5);
  };

  const getStockLevelClass = (available: number, threshold: number) => {
    if (available < 5) return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', label: 'Critical' };
    if (available < threshold) return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', label: 'Low' };
    return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', label: 'Good' };
  };

  const quickActions = [
    { name: 'Add Donor', icon: '➕👥', href: '/donors?action=add', color: 'from-green-500 to-green-600' },
    { name: 'Record Donation', icon: '➕💉', href: '/donations?action=add', color: 'from-red-500 to-red-600' },
    { name: 'Add Hospital', icon: '➕🏥', href: '/hospitals?action=add', color: 'from-purple-500 to-purple-600' },
    { name: 'Add Patient', icon: '➕🤒', href: '/patients?action=add', color: 'from-yellow-500 to-yellow-600' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse">🩺</span>
        </div>
        <div className="text-xl text-gray-600 mt-4 font-medium animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  const lowStockAlerts = getLowStockAlerts();
  const recentDonors = getRecentDonors();
  const recentDonations = getRecentDonations();

  return (
    <div className="bg-gradient-to-br from-gray-100 via-red-50/20 to-blue-50/20 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Blood Inventory Management System Overview</p>
        </div>
        <button
          onClick={() => router.push('/menu')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <span>🏠</span>
          Main Menu
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Donors"
          value={`${stats.eligibleDonors}/${stats.donors}`}
          icon="👥"
          color="blue"
          subtitle="Eligible / Total"
        />
        <StatsCard
          title="Total Blood Units"
          value={stats.totalBloodUnits}
          icon="🩸"
          color="red"
          subtitle="Available in Inventory"
        />
        <StatsCard
          title="Patients"
          value={stats.patients}
          icon="🤒"
          color="orange"
          subtitle="Requiring Transfusion"
        />
        <StatsCard
          title="Hospitals"
          value={stats.hospitals}
          icon="🏥"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Blood Inventory Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">🩸</span>
                Blood Inventory Summary
              </h2>
              <Link
                href="/inventory"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Full Inventory →
              </Link>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {inventory.map((item) => {
                const stockLevel = getStockLevelClass(item.available_units, item.minimum_threshold);
                return (
                  <div
                    key={item.blood_type}
                    className={`${stockLevel.bg} border-2 ${stockLevel.border} rounded-lg p-3 text-center`}
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
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Quick Actions
          </h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="group block p-3 bg-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white border-2 border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <span className="font-semibold text-sm text-gray-800 group-hover:text-gray-900">
                    {action.name}
                  </span>
                  <span className="ml-auto text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-5 mb-6 border-l-4 border-red-500">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Low Blood Stock Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {lowStockAlerts.map((item) => (
              <div
                key={item.blood_type}
                className="flex items-center gap-3 p-3 bg-red-50 border-2 border-red-300 rounded-lg"
              >
                <span className="text-2xl">🚨</span>
                <div className="flex-1">
                  <p className="font-bold text-red-700">Blood Type {item.blood_type}</p>
                  <p className="text-sm text-red-600">
                    {item.available_units} / {item.minimum_threshold} units
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Donors */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">👥</span>
              Recent Donors
            </h2>
            <Link
              href="/donors"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {recentDonors.length > 0 ? (
              recentDonors.map((donor) => (
                <div
                  key={donor.donor_id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {donor.first_name} {donor.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {donor.abo_group}{donor.rh_factor} • {donor.phone_number}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No donors yet</p>
            )}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">💉</span>
              Recent Donations
            </h2>
            <Link
              href="/donations"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {recentDonations.length > 0 ? (
              recentDonations.map((donation) => {
                const donor = donors.find(d => d.donor_id === donation.donor_id);
                const bloodType = donation.blood_type || 
                  (donation.donors ? `${donation.donors.abo_group}${donation.donors.rh_factor}` : 
                   (donor ? `${donor.abo_group}${donor.rh_factor}` : 'Unknown'));
                const donorName = donation.donor_name || 
                  (donation.donors ? `${donation.donors.first_name} ${donation.donors.last_name}` :
                   (donor ? `${donor.first_name} ${donor.last_name}` : 'Unknown Donor'));
                
                return (
                  <div
                    key={donation.donation_id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-xl">
                      🩸
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {donorName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {bloodType} • {donation.quantity_ml}ml
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No donations yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
