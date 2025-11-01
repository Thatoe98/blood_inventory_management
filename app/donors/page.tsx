'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { fetchDonors, createDonor, updateDonor, deleteDonor } from '@/lib/api';
import type { Donor, DonorWithEligibility } from '@/lib/types';
import { formatDate, validateEmail, validateAge } from '@/lib/utils';

type ToastType = { message: string; type: 'success' | 'error' | 'info' } | null;

export default function DonorsPage() {
  const searchParams = useSearchParams();
  const [donors, setDonors] = useState<DonorWithEligibility[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<DonorWithEligibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [toast, setToast] = useState<ToastType>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('');
  const [filterEligibility, setFilterEligibility] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    loadDonors();
    
    // Check if action=add in URL
    const action = searchParams.get('action');
    if (action === 'add') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    filterDonorsList();
  }, [searchTerm, filterBloodType, filterEligibility, donors]);

  const loadDonors = async () => {
    try {
      setLoading(true);
      const data = await fetchDonors();
      
      // Calculate eligibility and days since last donation
      const now = new Date();
      const processedData = data.map(donor => {
        const donorWithEligibility: DonorWithEligibility = { ...donor } as DonorWithEligibility;
        
        if (donor.last_donation_date) {
          const lastDonation = new Date(donor.last_donation_date);
          const daysSince = Math.floor((now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
          donorWithEligibility.days_since_last_donation = daysSince;
          
          // Eligible if more than 58 days since last donation
          donorWithEligibility.eligibility_status = daysSince > 58 ? 'Eligible' : 'Ineligible';
          donorWithEligibility.calculated_eligibility = daysSince > 58 ? 'Eligible' : 'Deferred';
          
          if (daysSince <= 58) {
            donorWithEligibility.days_until_eligible = 59 - daysSince;
          }
        } else {
          // Never donated = eligible
          donorWithEligibility.eligibility_status = 'Eligible';
          donorWithEligibility.calculated_eligibility = 'Eligible';
          donorWithEligibility.days_since_last_donation = undefined;
        }
        
        donorWithEligibility.full_name = `${donor.first_name} ${donor.last_name}`;
        donorWithEligibility.blood_type = `${donor.abo_group}${donor.rh_factor}`;
        
        return donorWithEligibility;
      });
      
      setDonors(processedData);
    } catch (error) {
      showToast('Failed to load donors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterDonorsList = () => {
    let filtered = donors;

    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          `${d.first_name} ${d.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (d.email && d.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          d.phone_number.includes(searchTerm)
      );
    }

    if (filterBloodType) {
      filtered = filtered.filter((d) => `${d.abo_group}${d.rh_factor}` === filterBloodType);
    }

    if (filterEligibility) {
      filtered = filtered.filter((d) => d.eligibility_status === filterEligibility);
    }

    setFilteredDonors(filtered);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const lastDonationDate = formData.get('last_donation_date') as string;
    const donorData: any = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      date_of_birth: formData.get('date_of_birth') as string,
      sex: formData.get('sex') as string,
      phone_number: formData.get('phone_number') as string,
      email: formData.get('email') as string,
      abo_group: formData.get('abo_group') as string,
      rh_factor: formData.get('rh_factor') as string,
      city: formData.get('city') as string,
    };

    if (lastDonationDate) {
      donorData.last_donation_date = lastDonationDate;
    }

    // Validation
    if (donorData.email && !validateEmail(donorData.email)) {
      showToast('Invalid email address', 'error');
      return;
    }

    if (!validateAge(donorData.date_of_birth, 18)) {
      showToast('Donor must be at least 18 years old', 'error');
      return;
    }

    try {
      if (editingDonor) {
        await updateDonor(editingDonor.donor_id, donorData);
        showToast('Donor updated successfully', 'success');
      } else {
        await createDonor(donorData);
        showToast('Donor created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingDonor(null);
      loadDonors();
    } catch (error) {
      showToast('Failed to save donor', 'error');
    }
  };

  const handleEdit = (donor: Donor) => {
    setEditingDonor(donor);
    setIsModalOpen(true);
  };

  const handleDelete = async (donor: Donor) => {
    if (!confirm(`Are you sure you want to delete ${donor.first_name} ${donor.last_name}?`)) return;

    try {
      await deleteDonor(donor.donor_id);
      showToast('Donor deleted successfully', 'success');
      loadDonors();
    } catch (error) {
      showToast('Failed to delete donor', 'error');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Date of Birth', 'Blood Type', 'Phone', 'Email', 'City', 'Status'];
    const rows = filteredDonors.map((d) => [
      d.full_name || `${d.first_name} ${d.last_name}`,
      d.date_of_birth,
      d.blood_type || `${d.abo_group}${d.rh_factor}`,
      d.phone_number,
      d.email || '',
      d.city || '',
      d.eligibility_status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'donors.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse">👥</span>
        </div>
        <div className="text-xl text-gray-600 mt-4 font-medium animate-pulse">Loading donors...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 via-red-50/20 to-blue-50/20 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Donors</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => {
              setEditingDonor(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            + Add Donor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        />
        <select
          value={filterBloodType}
          onChange={(e) => setFilterBloodType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        >
          <option value="">All Blood Types</option>
          {bloodTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={filterEligibility}
          onChange={(e) => setFilterEligibility(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        >
          <option value="">All Statuses</option>
          <option value="Eligible">Eligible</option>
          <option value="Not Eligible">Not Eligible</option>
        </select>
        <button
          onClick={() => {
            setSearchTerm('');
            setFilterBloodType('');
            setFilterEligibility('');
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Filters
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <Table
          columns={[
            { 
              key: 'full_name', 
              label: 'Name',
              render: (donor: any) => donor.full_name || `${donor.first_name} ${donor.last_name}`
            },
            { 
              key: 'blood_type', 
              label: 'Blood Type',
              render: (donor: any) => donor.blood_type || `${donor.abo_group}${donor.rh_factor}`
            },
            { key: 'phone_number', label: 'Phone' },
            { 
              key: 'last_donation_date', 
              label: 'Last Donation',
              render: (donor: any) => {
                if (!donor.last_donation_date) {
                  return <span className="text-gray-500 italic">Never donated</span>;
                }
                const date = new Date(donor.last_donation_date);
                const formattedDate = date.toLocaleDateString();
                const daysAgo = donor.days_since_last_donation;
                return (
                  <span>
                    {formattedDate} <span className="text-gray-500">({daysAgo} {daysAgo === 1 ? 'day' : 'days'} ago)</span>
                  </span>
                );
              }
            },
            { key: 'city', label: 'City' },
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
          data={filteredDonors.map(d => ({ ...d, id: d.donor_id }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No donors found"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDonor(null);
        }}
        title={editingDonor ? 'Edit Donor' : 'Add New Donor'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                defaultValue={editingDonor?.first_name}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Last Name *</label>
              <input
                type="text"
                name="last_name"
                defaultValue={editingDonor?.last_name}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                defaultValue={editingDonor?.date_of_birth}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Sex *</label>
              <select
                name="sex"
                defaultValue={editingDonor?.sex}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">ABO Group *</label>
              <select
                name="abo_group"
                defaultValue={editingDonor?.abo_group}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Rh Factor *</label>
              <select
                name="rh_factor"
                defaultValue={editingDonor?.rh_factor}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select</option>
                <option value="+">+</option>
                <option value="-">-</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Phone *</label>
              <input
                type="tel"
                name="phone_number"
                defaultValue={editingDonor?.phone_number}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={editingDonor?.email}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">City</label>
            <input
              type="text"
              name="city"
              defaultValue={editingDonor?.city}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Last Donation Date</label>
            <input
              type="date"
              name="last_donation_date"
              defaultValue={editingDonor?.last_donation_date || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {editingDonor ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingDonor(null);
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
