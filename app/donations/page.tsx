'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import {
  fetchDonations,
  createDonation,
  updateDonation,
  deleteDonation,
  fetchDonors,
  fetchHospitals,
  fetchCampaigns,
} from '@/lib/api';
import type { Donation, Donor, Hospital, Campaign, DonorWithEligibility } from '@/lib/types';
import { formatDate, formatDateReadable } from '@/lib/utils';

type ToastType = { message: string; type: 'success' | 'error' | 'info' } | null;

export default function DonationsPage() {
  const searchParams = useSearchParams();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [toast, setToast] = useState<ToastType>(null);
  
  // Form states for controlled inputs
  const [selectedDonorId, setSelectedDonorId] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [quantityMl, setQuantityMl] = useState('450');
  const [hemoglobinLevel, setHemoglobinLevel] = useState('13.0');
  
  // Filter states
  const [searchName, setSearchName] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterHospitalId, setFilterHospitalId] = useState('');

  useEffect(() => {
    loadData();
    
    // Check if action=add in URL
    const action = searchParams.get('action');
    if (action === 'add') {
      setIsModalOpen(true);
    }
    
    // Check if returning from adding a donor
    const returnFrom = searchParams.get('returnFrom');
    if (returnFrom === 'donor' && action === 'add') {
      // Show success message
      showToast('Donor added successfully! You can now select them.', 'success');
      // Clear the pending donation data after a short delay
      setTimeout(() => {
        localStorage.removeItem('pendingDonation');
      }, 1000);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [donationsData, donorsData, hospitalsData, campaignsData] = await Promise.all([
        fetchDonations(),
        fetchDonors(),
        fetchHospitals(),
        fetchCampaigns(),
      ]);
      setDonations(donationsData);
      setDonors(donorsData);
      setHospitals(hospitalsData);
      setCampaigns(campaignsData);
    } catch (error) {
      showToast('Failed to load donations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // Filter donations based on search and filters
  const filteredDonations = donations.filter((donation) => {
    const donorName = donation.donor_name?.toLowerCase() || '';
    const matchesName = searchName === '' || donorName.includes(searchName.toLowerCase());
    
    if (!matchesName) return false;

    // Hospital filtering
    if (filterHospitalId && donation.hospital_id !== filterHospitalId) {
      return false;
    }

    // Date filtering
    if (filterMonth || filterYear) {
      const donationDate = new Date(donation.donation_timestamp);
      const donationMonth = donationDate.getMonth() + 1; // 1-12
      const donationYear = donationDate.getFullYear();

      if (filterMonth && parseInt(filterMonth) !== donationMonth) return false;
      if (filterYear && parseInt(filterYear) !== donationYear) return false;
    }

    return true;
  });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const donationData: any = {
      donor_id: selectedDonorId,
      hospital_id: selectedHospitalId,
      quantity_ml: parseInt(quantityMl) || 450,
    };

    // Only include hemoglobin_level if it has a value
    if (hemoglobinLevel && hemoglobinLevel.trim() !== '') {
      donationData.hemoglobin_level = parseFloat(hemoglobinLevel);
    }

    // Only include campaign_id if it has a value
    if (selectedCampaignId && selectedCampaignId.trim() !== '') {
      donationData.campaign_id = selectedCampaignId;
    }

    try {
      if (editingDonation) {
        await updateDonation(editingDonation.donation_id, donationData);
        showToast('Donation updated successfully', 'success');
      } else {
        await createDonation(donationData);
        showToast('Donation created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingDonation(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving donation:', error);
      showToast(`Failed to save donation: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const resetForm = () => {
    setSelectedDonorId('');
    setSelectedHospitalId('');
    setSelectedCampaignId('');
    setQuantityMl('450');
    setHemoglobinLevel('13.0');
  };

  const handleEdit = (donation: Donation) => {
    setEditingDonation(donation);
    setSelectedDonorId(donation.donor_id);
    setSelectedHospitalId(donation.hospital_id);
    setSelectedCampaignId(donation.campaign_id || '');
    setQuantityMl(donation.quantity_ml?.toString() || '450');
    setHemoglobinLevel(donation.hemoglobin_level?.toString() || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (donation: Donation) => {
    if (!confirm('Are you sure you want to delete this donation?')) return;

    try {
      await deleteDonation(donation.donation_id);
      showToast('Donation deleted successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to delete donation', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse">💉</span>
        </div>
        <div className="text-xl text-gray-600 mt-4 font-medium animate-pulse">Loading donations...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 via-red-50/20 to-blue-50/20 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Donations</h1>
        <button
          onClick={() => {
            setEditingDonation(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          + Add Donation
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="space-y-3">
          {/* Search Box */}
          <div>
            <input
              type="text"
              placeholder="Search by donor name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterHospitalId}
              onChange={(e) => setFilterHospitalId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="">All Hospitals</option>
              {hospitals.map((hospital) => (
                <option key={hospital.hospital_id} value={hospital.hospital_id}>
                  {hospital.name}
                </option>
              ))}
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="">All Years</option>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>

            {(searchName || filterMonth || filterYear || filterHospitalId) && (
              <button
                onClick={() => {
                  setSearchName('');
                  setFilterMonth('');
                  setFilterYear('');
                  setFilterHospitalId('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <Table
          columns={[
            {
              key: 'donation_timestamp',
              label: 'Date',
              render: (d: Donation) => formatDateReadable(d.donation_timestamp),
            },
            { key: 'donor_name', label: 'Donor' },
            { key: 'blood_type', label: 'Blood Type' },
            { 
              key: 'quantity_ml', 
              label: 'Quantity (ml)',
              render: (d: Donation) => `${d.quantity_ml} ml`
            },
            { key: 'hospital_name', label: 'Hospital' },
            { key: 'campaign_name', label: 'Campaign' },
          ]}
          data={filteredDonations.map(d => ({ ...d, id: d.donation_id }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No donations found"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDonation(null);
          resetForm();
        }}
        title={editingDonation ? 'Edit Donation' : 'Add New Donation'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {editingDonation ? (
            // When editing, show donor info as read-only
            <div>
              <label className="block text-sm font-semibold mb-1">Donor</label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-gray-700">
                {editingDonation.donor_name} - {editingDonation.blood_type}
              </div>
              <p className="text-xs text-gray-500 mt-1">Donor cannot be changed when editing</p>
            </div>
          ) : (
            // When adding new, show donor selection with add button
            <div>
              <label className="block text-sm font-semibold mb-1">Donor *</label>
              <div className="flex gap-2">
                <select
                  name="donor_id"
                  value={selectedDonorId}
                  onChange={(e) => setSelectedDonorId(e.target.value)}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Donor</option>
                  {donors
                    .filter((donor) => {
                      // Only show eligible donors
                      const now = new Date();
                      if (donor.last_donation_date) {
                        const lastDonation = new Date(donor.last_donation_date);
                        const daysSince = Math.floor((now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
                        return daysSince > 58; // Only eligible donors (>58 days)
                      }
                      return true; // Never donated = eligible
                    })
                    .map((donor) => {
                      const bloodType = `${donor.abo_group}${donor.rh_factor}`;
                      return (
                        <option key={donor.donor_id} value={donor.donor_id}>
                          {`${donor.first_name} ${donor.last_name}`} - {bloodType} (Eligible)
                        </option>
                      );
                    })}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    // Save current form state to localStorage
                    localStorage.setItem('pendingDonation', JSON.stringify({
                      hospital_id: selectedHospitalId,
                      quantity_ml: quantityMl,
                      hemoglobin_level: hemoglobinLevel,
                      campaign_id: selectedCampaignId,
                      returnToDonations: true
                    }));
                    // Navigate to add donor page
                    window.location.href = '/donors?action=add&returnTo=donations';
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap font-semibold flex items-center gap-1 shadow-md hover:shadow-lg transition-all duration-300"
                  title="Add New Donor"
                >
                  <span>➕</span>
                  <span>Add Donor</span>
                </button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Quantity (ml) *</label>
              <input
                type="number"
                name="quantity_ml"
                min="1"
                value={quantityMl}
                onChange={(e) => setQuantityMl(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Hemoglobin Level</label>
              <input
                type="number"
                step="0.01"
                name="hemoglobin_level"
                value={hemoglobinLevel}
                onChange={(e) => setHemoglobinLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Hospital *</label>
            <select
              name="hospital_id"
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">Select Hospital</option>
              {hospitals.map((hospital) => (
                <option key={hospital.hospital_id} value={hospital.hospital_id}>
                  {hospital.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Campaign (Optional)</label>
            <select
              name="campaign_id"
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">None</option>
              {campaigns
                .filter((campaign) => {
                  // Only show ongoing campaigns (started and not yet ended)
                  const today = new Date();
                  const startDate = new Date(campaign.start_date);
                  const endDate = new Date(campaign.end_date);
                  return startDate <= today && endDate >= today;
                })
                .map((campaign) => (
                  <option key={campaign.campaign_id} value={campaign.campaign_id}>
                    {campaign.name}
                  </option>
                ))}
            </select>
            {campaigns.filter((c) => {
              const today = new Date();
              const startDate = new Date(c.start_date);
              const endDate = new Date(c.end_date);
              return startDate <= today && endDate >= today;
            }).length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No ongoing campaigns at the moment</p>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {editingDonation ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingDonation(null);
                resetForm();
              }}
              className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
