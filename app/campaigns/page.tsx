'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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

    const notesValue = formData.get('notes') as string;
    
    const campaignData: any = {
      name: formData.get('name') as string,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      location: formData.get('location') as string,
      hospital_id: formData.get('hospital_id') as string,
    };

    // Only include notes if it has a value
    if (notesValue && notesValue.trim() !== '') {
      campaignData.notes = notesValue;
    }

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

  // Organize campaigns by status
  const today = new Date();
  const ongoingCampaigns = campaigns.filter(c => {
    const start = new Date(c.start_date);
    const end = new Date(c.end_date);
    return start <= today && end >= today;
  });
  const upcomingCampaigns = campaigns.filter(c => new Date(c.start_date) > today);
  const pastCampaigns = campaigns.filter(c => new Date(c.end_date) < today);

  const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);
    const isOngoing = start <= today && end >= today;
    const isUpcoming = start > today;
    const isPast = end < today;

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-red-300 group">
        {/* Card Header */}
        <div className={`p-4 ${isOngoing ? 'bg-gradient-to-r from-green-500 to-emerald-500' : isUpcoming ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{campaign.name}</h3>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <span>🏥</span>
                <span className="font-medium">{campaign.hospital_name}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(campaign)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                title="Edit Campaign"
              >
                <span className="text-white">✏️</span>
              </button>
              <button
                onClick={() => handleDelete(campaign)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                title="Delete Campaign"
              >
                <span className="text-white">🗑️</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 font-medium mb-1">Start Date</div>
              <div className="text-sm font-semibold text-gray-800">{formatDateReadable(campaign.start_date)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 font-medium mb-1">End Date</div>
              <div className="text-sm font-semibold text-gray-800">{formatDateReadable(campaign.end_date)}</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 text-sm">
            <span className="text-lg">📍</span>
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium">Location</div>
              <div className="text-gray-700">{campaign.location}</div>
            </div>
          </div>

          {/* Units Collected */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3 border border-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🩸</span>
                <div>
                  <div className="text-xs text-gray-600 font-medium">Units Collected</div>
                  <div className="text-2xl font-bold text-red-600">{campaign.total_units_collected || 0}</div>
                </div>
              </div>
              {(campaign.total_units_collected || 0) > 0 && (
                <div className="text-green-600 font-semibold text-sm">
                  ✓ Active
                </div>
              )}
            </div>
          </div>

          {/* Notes (if any) */}
          {campaign.notes && (
            <div className="text-xs text-gray-600 bg-yellow-50 rounded p-2 border border-yellow-100">
              <span className="font-semibold">Note:</span> {campaign.notes}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 via-red-50/20 to-blue-50/20 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Blood Donation Campaigns</h1>
          <p className="text-gray-600 mt-1">Organize and track donation campaigns</p>
        </div>
        <button
          onClick={() => {
            setEditingCampaign(null);
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center gap-2"
        >
          <span className="text-xl">➕</span>
          <span>Add Campaign</span>
        </button>
      </div>

      {/* Ongoing Campaigns */}
      {ongoingCampaigns.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Ongoing Campaigns</h2>
              <p className="text-sm text-gray-600">Currently active campaigns</p>
            </div>
            <div className="ml-auto bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
              {ongoingCampaigns.length} Active
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoingCampaigns.map(campaign => (
              <CampaignCard key={campaign.campaign_id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Campaigns */}
      {upcomingCampaigns.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-xl">🔜</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Upcoming Campaigns</h2>
              <p className="text-sm text-gray-600">Scheduled for the future</p>
            </div>
            <div className="ml-auto bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm">
              {upcomingCampaigns.length} Planned
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingCampaigns.map(campaign => (
              <CampaignCard key={campaign.campaign_id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      {/* Past Campaigns */}
      {pastCampaigns.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-xl">📜</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Past Campaigns</h2>
              <p className="text-sm text-gray-600">Completed campaigns</p>
            </div>
            <div className="ml-auto bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-bold text-sm">
              {pastCampaigns.length} Completed
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastCampaigns.map(campaign => (
              <CampaignCard key={campaign.campaign_id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {campaigns.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Campaigns Yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first blood donation campaign</p>
          <button
            onClick={() => {
              setEditingCampaign(null);
              setIsModalOpen(true);
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold inline-flex items-center gap-2"
          >
            <span>➕</span>
            <span>Create First Campaign</span>
          </button>
        </div>
      )}

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
          <div>
            <label className="block text-sm font-semibold mb-1">Notes (Optional)</label>
            <textarea
              name="notes"
              defaultValue={editingCampaign?.notes}
              rows={3}
              placeholder="Add any additional information about the campaign..."
              className="w-full px-3 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
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
