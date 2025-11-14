'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import DatePicker from '@/components/DatePicker';
import { 
  fetchTransfusions, 
  createTransfusion, 
  deleteTransfusion,
  fetchPatients,
  fetchInventory,
  fetchHospitals
} from '@/lib/api';
import type { Transfusion, Patient, Inventory, Hospital } from '@/lib/types';

export default function TransfusionsPage() {
  const [transfusions, setTransfusions] = useState<Transfusion[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedInventory, setSelectedInventory] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [transfusionDate, setTransfusionDate] = useState<Date>(new Date());
  const [unitsTransfused, setUnitsTransfused] = useState('1');
  const [notes, setNotes] = useState('');

  // Filter states
  const [searchPatient, setSearchPatient] = useState('');
  const [filterHospital, setFilterHospital] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    loadData();
    
    // Check if we should open the modal
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('action') === 'add') {
      setIsModalOpen(true);
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transfusionsData, patientsData, inventoryData, hospitalsData] = await Promise.all([
        fetchTransfusions(),
        fetchPatients(),
        fetchInventory(),
        fetchHospitals()
      ]);
      setTransfusions(transfusionsData);
      setPatients(patientsData);
      // Only show available inventory
      setInventory(inventoryData.filter((item: Inventory) => item.status === 'Available'));
      setHospitals(hospitalsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedPatient('');
    setSelectedInventory('');
    setSelectedHospital('');
    setTransfusionDate(new Date());
    setUnitsTransfused('1');
    setNotes('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !selectedInventory || !selectedHospital) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const transfusionData: any = {
        patient_id: selectedPatient,
        inventory_id: selectedInventory,
        hospital_id: selectedHospital,
        transfusion_date: transfusionDate.toISOString(),
        units_transfused: parseInt(unitsTransfused)
      };
      
      if (notes) {
        transfusionData.notes = notes;
      }

      await createTransfusion(transfusionData);
      showToast('Transfusion recorded successfully! Patient and blood unit removed.', 'success');
      handleCloseModal();
      await loadData();
    } catch (error: any) {
      console.error('Error saving transfusion:', error);
      showToast(error.message || 'Failed to save transfusion', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transfusion record?')) return;

    try {
      await deleteTransfusion(id);
      showToast('Transfusion deleted successfully', 'success');
      await loadData();
    } catch (error) {
      console.error('Error deleting transfusion:', error);
      showToast('Failed to delete transfusion', 'error');
    }
  };

  // Filter patients by selected hospital and blood type compatibility
  const getCompatiblePatients = () => {
    if (!selectedInventory) return patients;
    
    const selectedUnit = inventory.find(inv => inv.inventory_id === selectedInventory);
    if (!selectedUnit) return patients;

    const donorBloodType = `${selectedUnit.abo_group}${selectedUnit.rh_factor}`;
    
    // Blood type compatibility rules
    const compatibilityMap: { [key: string]: string[] } = {
      'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'A-': ['A-', 'A+', 'AB-', 'AB+'],
      'A+': ['A+', 'AB+'],
      'B-': ['B-', 'B+', 'AB-', 'AB+'],
      'B+': ['B+', 'AB+'],
      'AB-': ['AB-', 'AB+'],
      'AB+': ['AB+']
    };

    const compatibleTypes = compatibilityMap[donorBloodType] || [];
    
    return patients.filter(patient => {
      const patientBloodType = `${patient.abo_group}${patient.rh_factor}`;
      return compatibleTypes.includes(patientBloodType);
    });
  };

  // Filter inventory by selected hospital
  const getHospitalInventory = () => {
    if (!selectedHospital) return inventory;
    return inventory.filter(inv => inv.hospital_id === selectedHospital);
  };

  // Filter transfusions
  const filteredTransfusions = transfusions.filter(transfusion => {
    if (searchPatient && !transfusion.patient_name?.toLowerCase().includes(searchPatient.toLowerCase())) {
      return false;
    }
    if (filterHospital && transfusion.hospital_id !== filterHospital) {
      return false;
    }
    if (filterMonth || filterYear) {
      const date = new Date(transfusion.transfusion_date);
      if (filterMonth && (date.getMonth() + 1).toString() !== filterMonth) return false;
      if (filterYear && date.getFullYear().toString() !== filterYear) return false;
    }
    return true;
  });

  const columns = [
    { key: 'transfusion_date', label: 'Date', render: (t: any) => new Date(t.transfusion_date).toLocaleDateString() },
    { key: 'patient_name', label: 'Patient' },
    { key: 'case_no', label: 'Case No' },
    { key: 'blood_type', label: 'Blood Type' },
    { key: 'hospital_name', label: 'Hospital' },
    { key: 'units_transfused', label: 'Units' },
    { key: 'notes', label: 'Notes', render: (t: any) => t.notes || '-' },
  ];

  const uniqueYears = Array.from(new Set(transfusions.map(t => new Date(t.transfusion_date).getFullYear()))).sort((a, b) => b - a);
  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
    { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
          Blood Transfusions
        </h1>
        <button
          onClick={handleOpenModal}
          className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition"
        >
          + Record Transfusion
        </button>
      </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <select
              value={filterHospital}
              onChange={(e) => setFilterHospital(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Hospitals</option>
              {hospitals.map(hospital => (
                <option key={hospital.hospital_id} value={hospital.hospital_id}>
                  {hospital.name}
                </option>
              ))}
            </select>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <Table
            data={filteredTransfusions.map(t => ({ ...t, id: t.transfusion_id }))}
            columns={columns}
            onDelete={(item: any) => handleDelete(item.transfusion_id)}
          />
        )}

        {/* Add/Edit Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Record Transfusion">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Hospital */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedHospital}
                onChange={(e) => {
                  setSelectedHospital(e.target.value);
                  setSelectedInventory('');
                  setSelectedPatient('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select Hospital</option>
                {hospitals.map(hospital => (
                  <option key={hospital.hospital_id} value={hospital.hospital_id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Blood Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedInventory}
                onChange={(e) => {
                  setSelectedInventory(e.target.value);
                  setSelectedPatient('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={!selectedHospital}
              >
                <option value="">Select Blood Unit</option>
                {getHospitalInventory().map(inv => (
                  <option key={inv.inventory_id} value={inv.inventory_id}>
                    {inv.blood_type || `${inv.abo_group}${inv.rh_factor}`} - 
                    Collected: {new Date(inv.collection_ts).toLocaleDateString()} - 
                    Expires: {new Date(inv.expiry_ts).toLocaleDateString()}
                  </option>
                ))}
              </select>
              {selectedHospital && getHospitalInventory().length === 0 && (
                <p className="text-sm text-red-500 mt-1">No available blood units at this hospital</p>
              )}
            </div>

            {/* Patient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={!selectedInventory}
              >
                <option value="">Select Patient</option>
                {getCompatiblePatients().map(patient => (
                  <option key={patient.patient_id} value={patient.patient_id}>
                    {patient.first_name} {patient.last_name} - {patient.case_no} - {patient.abo_group}{patient.rh_factor}
                  </option>
                ))}
              </select>
              {selectedInventory && getCompatiblePatients().length === 0 && (
                <p className="text-sm text-red-500 mt-1">No compatible patients for this blood type</p>
              )}
            </div>

            {/* Transfusion Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfusion Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={transfusionDate}
                onChange={(date) => date && setTransfusionDate(date)}
                maxDate={new Date()}
                required
              />
            </div>

            {/* Units Transfused */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Units Transfused <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={unitsTransfused}
                onChange={(e) => setUnitsTransfused(e.target.value)}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition"
              >
                Record Transfusion
              </button>
            </div>
          </form>
        </Modal>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
