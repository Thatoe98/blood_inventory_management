'use client';

import { useEffect, useState } from 'react';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { fetchPatients, createPatient, updatePatient, deletePatient, fetchHospitals } from '@/lib/api';
import type { Patient, Hospital } from '@/lib/types';
import { formatDateReadable } from '@/lib/utils';

type ToastType = { message: string; type: 'success' | 'error' | 'info' } | null;

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [toast, setToast] = useState<ToastType>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('');
  const [filterHospital, setFilterHospital] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPatientsList();
  }, [searchTerm, filterBloodType, filterHospital, patients]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsData, hospitalsData] = await Promise.all([
        fetchPatients(),
        fetchHospitals(),
      ]);
      setPatients(patientsData);
      setHospitals(hospitalsData);
    } catch (error) {
      showToast('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterPatientsList = () => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.case_no.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterBloodType) {
      filtered = filtered.filter((p) => `${p.abo_group}${p.rh_factor}` === filterBloodType);
    }

    if (filterHospital) {
      filtered = filtered.filter((p) => p.hospital_id === filterHospital);
    }

    setFilteredPatients(filtered);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const patientData: any = {
      case_no: formData.get('case_no') as string,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      date_of_birth: formData.get('date_of_birth') as string,
      sex: formData.get('sex') as string,
      abo_group: formData.get('abo_group') as string,
      rh_factor: formData.get('rh_factor') as string,
      diagnosis: formData.get('diagnosis') as string,
      hospital_id: formData.get('hospital_id') as string,
    };

    try {
      if (editingPatient) {
        await updatePatient(editingPatient.patient_id, patientData);
        showToast('Patient updated successfully', 'success');
      } else {
        await createPatient(patientData);
        showToast('Patient created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingPatient(null);
      loadData();
    } catch (error) {
      showToast('Failed to save patient', 'error');
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleDelete = async (patient: Patient) => {
    if (!confirm(`Are you sure you want to delete ${patient.first_name} ${patient.last_name}?`)) return;

    try {
      await deletePatient(patient.patient_id);
      showToast('Patient deleted successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to delete patient', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse">🤒</span>
        </div>
        <div className="text-xl text-gray-600 mt-4 font-medium animate-pulse">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 via-red-50/20 to-blue-50/20 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Patients</h1>
        <button
          onClick={() => {
            setEditingPatient(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          + Add Patient
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search by name..."
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
          value={filterHospital}
          onChange={(e) => setFilterHospital(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        >
          <option value="">All Hospitals</option>
          {hospitals.map((hospital) => (
            <option key={hospital.hospital_id} value={hospital.hospital_id}>
              {hospital.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearchTerm('');
            setFilterBloodType('');
            setFilterHospital('');
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
              key: 'name', 
              label: 'Patient Name',
              render: (p: Patient) => `${p.first_name} ${p.last_name}`
            },
            { 
              key: 'blood_type', 
              label: 'Blood Type',
              render: (p: Patient) => `${p.abo_group}${p.rh_factor}`
            },
            { key: 'case_no', label: 'Case No' },
            { key: 'hospital_name', label: 'Hospital' },
            { key: 'diagnosis', label: 'Diagnosis' },
          ]}
          data={filteredPatients.map(p => ({ ...p, id: p.patient_id }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No patients found"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPatient(null);
        }}
        title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Case Number *</label>
            <input
              type="text"
              name="case_no"
              defaultValue={editingPatient?.case_no}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                defaultValue={editingPatient?.first_name}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Last Name *</label>
              <input
                type="text"
                name="last_name"
                defaultValue={editingPatient?.last_name}
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
                defaultValue={editingPatient?.date_of_birth}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Sex *</label>
              <select
                name="sex"
                defaultValue={editingPatient?.sex}
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
                defaultValue={editingPatient?.abo_group}
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
                defaultValue={editingPatient?.rh_factor}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select</option>
                <option value="+">+</option>
                <option value="-">-</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Hospital *</label>
            <select
              name="hospital_id"
              defaultValue={editingPatient?.hospital_id}
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
            <label className="block text-sm font-semibold mb-1">Diagnosis</label>
            <textarea
              name="diagnosis"
              defaultValue={editingPatient?.diagnosis}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {editingPatient ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingPatient(null);
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
