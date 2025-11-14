'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';
import Modal from '@/components/Modal';
import DatePicker from '@/components/DatePicker';
import { fetchPatients, updatePatient, deletePatient } from '@/lib/api';
import type { Patient } from '@/lib/types';
import { formatDateReadable } from '@/lib/utils';

type ToastType = { message: string; type: 'success' | 'error' | 'info' } | null;

export default function HospitalViewPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastType>(null);
  const [hospitalId, setHospitalId] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem('isAuthenticated');
    const userInfo = localStorage.getItem('bloodbank_user');
    
    if (!isAuth || !userInfo) {
      router.push('/login');
      return;
    }

    try {
      const parsed = JSON.parse(userInfo);
      if (parsed.role !== 'hospital') {
        router.push('/menu');
        return;
      }
      setHospitalId(parsed.hospitalId || '');
      setHospitalName(parsed.hospitalName || 'Hospital User');
      loadData(parsed.hospitalId);
    } catch (error) {
      console.error('Error parsing user info:', error);
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    filterPatientsList();
  }, [searchTerm, filterBloodType, patients]);

  const loadData = async (hospitalId: string) => {
    try {
      setLoading(true);
      const patientsData = await fetchPatients();
      // Filter patients for this hospital only
      const hospitalPatients = patientsData.filter((p) => p.hospital_id === hospitalId);
      setPatients(hospitalPatients);
      setFilteredPatients(hospitalPatients);
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
        p.case_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterBloodType) {
      filtered = filtered.filter((p) => `${p.abo_group}${p.rh_factor}` === filterBloodType);
    }

    setFilteredPatients(filtered);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setDateOfBirth(patient.date_of_birth ? new Date(patient.date_of_birth) : null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Validate date
    if (!dateOfBirth) {
      showToast('Please select date of birth', 'error');
      return;
    }

    const patientData: any = {
      case_no: formData.get('case_no') as string,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      date_of_birth: dateOfBirth.toISOString().split('T')[0],
      sex: formData.get('sex') as string,
      abo_group: formData.get('abo_group') as string,
      rh_factor: formData.get('rh_factor') as string,
      diagnosis: formData.get('diagnosis') as string,
      hospital_id: hospitalId, // Use logged-in hospital's ID
    };

    try {
      if (editingPatient) {
        await updatePatient(editingPatient.patient_id, patientData);
        showToast('Patient updated successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingPatient(null);
      setDateOfBirth(null);
      loadData(hospitalId);
    } catch (error) {
      showToast('Failed to save patient', 'error');
    }
  };

  const handleDelete = async (patient: Patient) => {
    if (!confirm(`Are you sure you want to delete ${patient.first_name} ${patient.last_name}?`)) return;

    try {
      await deletePatient(patient.patient_id);
      showToast('Patient deleted successfully', 'success');
      loadData(hospitalId);
    } catch (error) {
      showToast('Failed to delete patient', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('bloodbank_auth');
    localStorage.removeItem('bloodbank_user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 via-purple-50/20 to-blue-50/20">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse">🤒</span>
        </div>
        <div className="text-xl text-gray-600 mt-4 font-medium animate-pulse">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-50/20 to-blue-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 text-white py-4 px-4 md:px-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => router.push('/hospital/dashboard')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <span className="text-xl md:text-2xl">←</span>
              </button>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-xl md:text-2xl">🤒</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Patients List</h1>
                <p className="text-purple-100 text-xs md:text-sm">{hospitalName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 md:px-4 md:py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg font-semibold transition-all duration-300 flex items-center gap-1 md:gap-2 border border-white/30 text-xs md:text-sm"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="font-semibold text-blue-900">Patient Records</p>
              <p className="text-sm text-blue-700">View all patients registered at your hospital</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold text-gray-800">{patients.length}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Male</p>
                <p className="text-3xl font-bold text-gray-800">
                  {patients.filter((p) => p.sex === 'Male').length}
                </p>
              </div>
              <div className="text-4xl">👨</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Female</p>
                <p className="text-3xl font-bold text-gray-800">
                  {patients.filter((p) => p.sex === 'Female').length}
                </p>
              </div>
              <div className="text-4xl">👩</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Blood Types</p>
                <p className="text-3xl font-bold text-gray-800">
                  {new Set(patients.map((p) => `${p.abo_group}${p.rh_factor}`)).size}
                </p>
              </div>
              <div className="text-4xl">🩸</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by name, case number, or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={filterBloodType}
              onChange={(e) => setFilterBloodType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Blood Types</option>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {(searchTerm || filterBloodType) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterBloodType('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-blue-500 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Case No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Patient Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Blood Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Sex</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date of Birth</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Diagnosis</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📋</span>
                        <p>No patients found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient, index) => (
                    <tr
                      key={patient.patient_id}
                      className={`hover:bg-purple-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {patient.case_no}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {patient.abo_group}
                          {patient.rh_factor}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-1">
                          {patient.sex === 'Male' ? '👨' : patient.sex === 'Female' ? '👩' : '👤'}
                          {patient.sex}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDateReadable(patient.date_of_birth)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {patient.diagnosis || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(patient)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Showing {filteredPatients.length} of {patients.length} patients
          </p>
        </div>
      </div>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPatient(null);
          setDateOfBirth(null);
        }}
        title="Edit Patient"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Case Number *</label>
            <input
              type="text"
              name="case_no"
              defaultValue={editingPatient?.case_no}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Last Name *</label>
              <input
                type="text"
                name="last_name"
                defaultValue={editingPatient?.last_name}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Date of Birth *</label>
              <DatePicker
                selected={dateOfBirth}
                onChange={setDateOfBirth}
                maxDate={new Date()}
                placeholderText="Select date of birth"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Sex *</label>
              <select
                name="sex"
                defaultValue={editingPatient?.sex}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select</option>
                <option value="+">+</option>
                <option value="-">-</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Diagnosis</label>
            <textarea
              name="diagnosis"
              defaultValue={editingPatient?.diagnosis}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter diagnosis details..."
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold"
            >
              Update Patient
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingPatient(null);
                setDateOfBirth(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 font-semibold"
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
