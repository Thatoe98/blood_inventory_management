'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import DatePicker from '@/components/DatePicker';
import { fetchCampaigns, createCampaign, updateCampaign, deleteCampaign, fetchHospitals } from '@/lib/api';
import type { Campaign, Hospital } from '@/lib/types';
import { formatDate, formatDateReadable } from '@/lib/utils';

type ToastType = { message: string; type: 'success' | 'error' | 'info' } | null;

export default function CampaignsPage() {
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [toast, setToast] = useState<ToastType>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

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
      const [campaignsData, hospitalsData] = await Promise.all([
        fetchCampaigns(),
        fetchHospitals(),
      ]);
      setCampaigns(campaignsData);
      setHospitals(hospitalsData);
    } catch (error) {
      showToast('Failed to load campaigns', 'error');
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

    // Validate dates
    if (!startDate || !endDate) {
      showToast('Please select both start and end dates', 'error');
      return;
    }

    if (endDate < startDate) {
      showToast('End date must be after start date', 'error');
      return;
    }

    const campaignData = {
      name: formData.get('name') as string,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      location: formData.get('location') as string,
      hospital_id: formData.get('hospital_id') as string,
    };

    try {
      if (editingCampaign) {
        await updateCampaign(editingCampaign.campaign_id, campaignData);
        showToast('Campaign updated successfully', 'success');
      } else {
        await createCampaign(campaignData);
        showToast('Campaign created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingCampaign(null);
      setStartDate(null);
      setEndDate(null);
      loadData();
    } catch (error) {
      showToast('Failed to save campaign', 'error');
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setStartDate(campaign.start_date ? new Date(campaign.start_date) : null);
    setEndDate(campaign.end_date ? new Date(campaign.end_date) : null);
    setIsModalOpen(true);
  };

  const handleDelete = async (campaign: Campaign) => {
    if (!confirm(`Are you sure you want to delete ${campaign.name}?`)) return;

    try {
      await deleteCampaign(campaign.campaign_id);
      showToast('Campaign deleted successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to delete campaign', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse">📢</span>
        </div>
        <div className="text-xl text-gray-600 mt-4 font-medium animate-pulse">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 via-red-50/20 to-blue-50/20 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Campaigns</h1>
        <button
          onClick={() => {
            setEditingCampaign(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          + Add Campaign
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <Table
          columns={[
            { key: 'name', label: 'Campaign Name' },
            {
              key: 'start_date',
              label: 'Start Date',
              render: (c: Campaign) => formatDateReadable(c.start_date),
            },
            {
              key: 'end_date',
              label: 'End Date',
              render: (c: Campaign) => formatDateReadable(c.end_date),
            },
            { key: 'location', label: 'Location' },
            { key: 'hospital_name', label: 'Hospital' },
          ]}
          data={campaigns.map(c => ({ ...c, id: c.campaign_id }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No campaigns found"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCampaign(null);
          setStartDate(null);
          setEndDate(null);
        }}
        title={editingCampaign ? 'Edit Campaign' : 'Add New Campaign'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Campaign Name *</label>
            <input
              type="text"
              name="name"
              defaultValue={editingCampaign?.name}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Start Date *</label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                minDate={new Date()}
                placeholderText="Select start date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">End Date *</label>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                minDate={startDate || new Date()}
                placeholderText="Select end date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Location *</label>
            <input
              type="text"
              name="location"
              defaultValue={editingCampaign?.location}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Hospital *</label>
            <select
              name="hospital_id"
              defaultValue={editingCampaign?.hospital_id}
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
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {editingCampaign ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCampaign(null);
                setStartDate(null);
                setEndDate(null);
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
