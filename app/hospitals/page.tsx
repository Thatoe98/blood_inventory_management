'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { fetchHospitals, createHospital, updateHospital, deleteHospital } from '@/lib/api';
import type { Hospital } from '@/lib/types';

type ToastType = { message: string; type: 'success' | 'error' | 'info' } | null;

export default function HospitalsPage() {
  const searchParams = useSearchParams();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [toast, setToast] = useState<ToastType>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [newHospitalPasskey, setNewHospitalPasskey] = useState<string | null>(null);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  
  // Get unique cities and types from hospitals for dropdowns
  const uniqueCities = Array.from(new Set(hospitals.map(h => h.city))).sort();
  const uniqueTypes = Array.from(new Set(hospitals.map(h => h.type).filter(Boolean))).sort();

  useEffect(() => {
    loadHospitals();
    
    // Check if action=add in URL
    const action = searchParams.get('action');
    if (action === 'add') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

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
      filtered = filtered.filter((h) => h.city === filterCity);
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
        setIsModalOpen(false);
        setEditingHospital(null);
      } else {
        const newHospital = await createHospital(hospitalData);
        // Show passkey modal for new hospital
        setNewHospitalPasskey(newHospital.passkey);
        setShowPasskeyModal(true);
        setIsModalOpen(false);
        setEditingHospital(null);
      }
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
          + Register Hospital
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
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        >
          <option value="">All Cities</option>
          {uniqueCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
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
            { key: 'phone', label: 'Phone' },
            { key: 'email', label: 'Email' },
            { 
              key: 'passkey', 
              label: 'Pass-Key',
              render: (h: Hospital) => (
                <span className="font-mono font-semibold text-red-600">
                  {h.passkey || 'N/A'}
                </span>
              )
            },
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
        title={editingHospital ? 'Edit Hospital' : 'Register New Hospital'}
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
              {uniqueTypes.map((type) => (
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

      {/* Passkey Modal */}
      <Modal
        isOpen={showPasskeyModal}
        onClose={() => {
          setShowPasskeyModal(false);
          setNewHospitalPasskey(null);
          showToast('Hospital registered successfully', 'success');
        }}
        title="🎉 Hospital Registered Successfully!"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 text-center">
            <p className="text-lg font-semibold text-gray-800 mb-3">
              Please save this Pass-Key for hospital login:
            </p>
            <div className="bg-white border-2 border-red-500 rounded-lg p-4 mb-4">
              <p className="text-3xl font-mono font-bold text-red-600 tracking-wider">
                {newHospitalPasskey}
              </p>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p className="flex items-center justify-center gap-2">
                <span className="text-yellow-600">⚠️</span>
                <span className="font-semibold">Important: Keep this Pass-Key secure!</span>
              </p>
              <p>This Pass-Key will be used for hospital user authentication.</p>
              <p>You can view it later in the hospitals table.</p>
            </div>
          </div>
          <button
            onClick={() => {
              // Copy to clipboard
              navigator.clipboard.writeText(newHospitalPasskey || '');
              showToast('Pass-Key copied to clipboard!', 'info');
            }}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
          >
            📋 Copy Pass-Key to Clipboard
          </button>
          <button
            onClick={() => {
              setShowPasskeyModal(false);
              setNewHospitalPasskey(null);
              showToast('Hospital registered successfully', 'success');
            }}
            className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
          >
            ✓ I've Saved the Pass-Key
          </button>
        </div>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
