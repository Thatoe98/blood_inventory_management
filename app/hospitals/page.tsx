'use client';

import { useEffect, useState } from 'react';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { fetchHospitals, createHospital, updateHospital, deleteHospital } from '@/lib/api';
import type { Hospital } from '@/lib/types';

type ToastType = { message: string; type: 'success' | 'error' | 'info' } | null;

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [toast, setToast] = useState<ToastType>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCity, setFilterCity] = useState('');

  const hospitalTypes = ['Government', 'Private', 'Trust'];

  useEffect(() => {
    loadHospitals();
  }, []);

  useEffect(() => {
    filterHospitalsList();
  }, [searchTerm, filterType, filterCity, hospitals]);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const data = await fetchHospitals();
      setHospitals(data);
    } catch (error) {
      showToast('Failed to load hospitals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterHospitalsList = () => {
    let filtered = hospitals;

    if (searchTerm) {
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter((h) => h.type === filterType);
    }

    if (filterCity) {
      filtered = filtered.filter((h) => h.city.toLowerCase().includes(filterCity.toLowerCase()));
    }

    setFilteredHospitals(filtered);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const hospitalData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postal_code: formData.get('postal_code') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
    };

    try {
      if (editingHospital) {
        await updateHospital(editingHospital.hospital_id, hospitalData);
        showToast('Hospital updated successfully', 'success');
      } else {
        await createHospital(hospitalData);
        showToast('Hospital created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingHospital(null);
      loadHospitals();
    } catch (error) {
      showToast('Failed to save hospital', 'error');
    }
  };

  const handleEdit = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setIsModalOpen(true);
  };

  const handleDelete = async (hospital: Hospital) => {
    if (!confirm(`Are you sure you want to delete ${hospital.name}?`)) return;

    try {
      await deleteHospital(hospital.hospital_id);
      showToast('Hospital deleted successfully', 'success');
      loadHospitals();
    } catch (error) {
      showToast('Failed to delete hospital', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse">🏥</span>
        </div>
        <div className="text-xl text-gray-600 mt-4 font-medium animate-pulse">Loading hospitals...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 via-red-50/20 to-blue-50/20 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hospitals</h1>
        <button
          onClick={() => {
            setEditingHospital(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          + Add Hospital
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search hospitals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        >
          <option value="">All Types</option>
          {hospitalTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Filter by city..."
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        />
        <button
          onClick={() => {
            setSearchTerm('');
            setFilterType('');
            setFilterCity('');
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Filters
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <Table
          columns={[
            { key: 'name', label: 'Hospital Name' },
            { key: 'type', label: 'Type' },
            { key: 'city', label: 'City' },
            { key: 'state', label: 'State' },
            { key: 'phone', label: 'Phone' },
            { key: 'email', label: 'Email' },
          ]}
          data={filteredHospitals.map(h => ({ ...h, id: h.hospital_id }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No hospitals found"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHospital(null);
        }}
        title={editingHospital ? 'Edit Hospital' : 'Add New Hospital'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Hospital Name *</label>
            <input
              type="text"
              name="name"
              defaultValue={editingHospital?.name}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Type *</label>
            <select
              name="type"
              defaultValue={editingHospital?.type}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">Select Type</option>
              {hospitalTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Address *</label>
            <input
              type="text"
              name="address"
              defaultValue={editingHospital?.address}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">City *</label>
            <input
              type="text"
              name="city"
              defaultValue={editingHospital?.city}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Phone *</label>
            <input
              type="tel"
              name="phone"
              defaultValue={editingHospital?.phone}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">State *</label>
            <input
              type="text"
              name="state"
              defaultValue={editingHospital?.state}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Postal Code *</label>
            <input
              type="text"
              name="postal_code"
              defaultValue={editingHospital?.postal_code}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              defaultValue={editingHospital?.email}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {editingHospital ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingHospital(null);
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
