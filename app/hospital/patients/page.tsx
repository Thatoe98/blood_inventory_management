'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function HospitalAddPatientPage() {
  const router = useRouter();
  const [hospitalId, setHospitalId] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    case_no: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    sex: 'Male',
    abo_group: 'A',
    rh_factor: '+',
    diagnosis: '',
    notes: '',
  });

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isAuthenticated');
      const userInfo = localStorage.getItem('bloodbank_user');
      
      if (!isAuth || !userInfo) {
        router.push('/login');
        return null;
      }

      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.role !== 'hospital') {
          router.push('/menu');
          return null;
        }
        return parsed;
      } catch (error) {
        console.error('Error parsing user info:', error);
        router.push('/login');
        return null;
      }
    };

    const userInfo = checkAuth();
    if (userInfo) {
      setHospitalId(userInfo.hospitalId);
      setHospitalName(userInfo.hospitalName);
      // Auto-generate case number
      const timestamp = Date.now().toString().slice(-8);
      setFormData(prev => ({ ...prev, case_no: `CASE-${timestamp}` }));
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: dbError } = await supabase
        .from('patients')
        .insert([{
          hospital_id: hospitalId,
          case_no: formData.case_no,
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          sex: formData.sex,
          abo_group: formData.abo_group,
          rh_factor: formData.rh_factor,
          diagnosis: formData.diagnosis || null,
          notes: formData.notes || null,
        }]);

      if (dbError) throw dbError;

      setSuccess('Patient registered successfully!');
      
      // Reset form with new case number
      const timestamp = Date.now().toString().slice(-8);
      setFormData({
        case_no: `CASE-${timestamp}`,
        first_name: '',
        last_name: '',
        date_of_birth: '',
        sex: 'Male',
        abo_group: 'A',
        rh_factor: '+',
        diagnosis: '',
        notes: '',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/hospital/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error adding patient:', err);
      setError(err.message || 'Failed to register patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-50/20 to-blue-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 text-white py-4 px-4 md:px-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/hospital/dashboard"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <span className="text-xl">←</span>
            </Link>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-xl">🤒</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Register New Patient</h1>
              <p className="text-purple-100 text-xs md:text-sm">{hospitalName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Case Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200">
                Case Information
              </h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Case Number *
                </label>
                <input
                  type="text"
                  name="case_no"
                  value={formData.case_no}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-gray-50"
                  required
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Auto-generated unique case number</p>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sex *
                  </label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Blood Type */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200">
                Blood Type *
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ABO Group
                  </label>
                  <select
                    name="abo_group"
                    value={formData.abo_group}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rh Factor
                  </label>
                  <select
                    name="rh_factor"
                    value={formData.rh_factor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    required
                  >
                    <option value="+">Positive (+)</option>
                    <option value="-">Negative (-)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200">
                Medical Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Diagnosis
                  </label>
                  <textarea
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    placeholder="Primary diagnosis and condition details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    placeholder="Allergies, special requirements, treatment history..."
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚕️</span>
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Patient Privacy</p>
                  <p>All patient information is confidential and protected. Ensure accurate blood type information for safe transfusions.</p>
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-2">
                <span className="text-red-600 text-xl">❌</span>
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-2">
                <span className="text-green-600 text-xl">✅</span>
                <p className="text-green-600 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registering Patient...
                  </span>
                ) : (
                  '➕ Register Patient'
                )}
              </button>

              <Link
                href="/hospital/dashboard"
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-300 flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
