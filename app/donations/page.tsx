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

  useEffect(() => {
    loadData();
    
    // Check if action=add in URL
    const action = searchParams.get('action');
    if (action === 'add') {
      setIsModalOpen(true);
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const campaignId = formData.get('campaign_id') as string;
    const donationData: any = {
      donor_id: formData.get('donor_id') as string,
      hospital_id: formData.get('hospital_id') as string,
      quantity_ml: parseInt(formData.get('quantity_ml') as string) || 450,
      test_result: formData.get('test_result') as string,
      hemoglobin_level: parseFloat(formData.get('hemoglobin_level') as string) || undefined,
    };

    if (campaignId) {
      donationData.campaign_id = campaignId;
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
      loadData();
    } catch (error) {
      showToast('Failed to save donation', 'error');
    }
  };

  const handleEdit = (donation: Donation) => {
    setEditingDonation(donation);
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
            {
              key: 'test_result',
              label: 'Test Result',
              render: (d: Donation) => (
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    d.test_result === 'Accepted'
                      ? 'bg-green-100 text-green-700'
                      : d.test_result === 'Rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {d.test_result}
                </span>
              ),
            },
          ]}
          data={donations.map(d => ({ ...d, id: d.donation_id }))}
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
        }}
        title={editingDonation ? 'Edit Donation' : 'Add New Donation'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Donor *</label>
            <select
              name="donor_id"
              defaultValue={editingDonation?.donor_id}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">Select Donor</option>
              {donors.map((donor) => {
                // Calculate eligibility
                const now = new Date();
                let eligibilityStatus = 'Eligible';
                if (donor.last_donation_date) {
                  const lastDonation = new Date(donor.last_donation_date);
                  const daysSince = Math.floor((now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
                  eligibilityStatus = daysSince > 58 ? 'Eligible' : 'Ineligible';
                }
                const bloodType = `${donor.abo_group}${donor.rh_factor}`;
                
                return (
                  <option key={donor.donor_id} value={donor.donor_id}>
                    {`${donor.first_name} ${donor.last_name}`} - {bloodType} ({eligibilityStatus})
                  </option>
                );
              })}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Quantity (ml) *</label>
              <input
                type="number"
                name="quantity_ml"
                min="1"
                defaultValue={editingDonation?.quantity_ml || 450}
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
                defaultValue={editingDonation?.hemoglobin_level}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Hospital *</label>
            <select
              name="hospital_id"
              defaultValue={editingDonation?.hospital_id}
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
              defaultValue={editingDonation?.campaign_id || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">None</option>
              {campaigns.map((campaign) => (
                <option key={campaign.campaign_id} value={campaign.campaign_id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Test Result *</label>
            <select
              name="test_result"
              defaultValue={editingDonation?.test_result || 'Pending'}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="Pending">Pending</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </select>
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
