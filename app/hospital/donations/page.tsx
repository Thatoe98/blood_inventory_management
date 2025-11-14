'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Donor {
  donor_id: string;
  first_name: string;
  last_name: string;
  abo_group: string;
  rh_factor: string;
}

export default function HospitalAddDonationPage() {
  const router = useRouter();
  const [hospitalId, setHospitalId] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [donors, setDonors] = useState<Donor[]>([]);

  const [formData, setFormData] = useState({
    donor_id: '',
    donation_timestamp: new Date().toISOString().slice(0, 16),
    quantity_ml: '450',
    hemoglobin_level: '',
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
      fetchDonors();
    }
  }, [router]);

  const fetchDonors = async () => {
    try {
      const { data, error } = await supabase
        .from('donors')
        .select('donor_id, first_name, last_name, abo_group, rh_factor')
        .order('last_name', { ascending: true });

      if (error) throw error;
      setDonors(data || []);
    } catch (err) {
      console.error('Error fetching donors:', err);
    } finally {
      setLoadingDonors(false);
    }
  };

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
      // Insert donation
      const { data: donationData, error: donationError } = await supabase
        .from('donations')
        .insert([{
          donor_id: formData.donor_id,
          hospital_id: hospitalId,
          donation_timestamp: formData.donation_timestamp,
          quantity_ml: parseInt(formData.quantity_ml),
          hemoglobin_level: formData.hemoglobin_level ? parseFloat(formData.hemoglobin_level) : null,
          notes: formData.notes || null,
        }])
        .select()
        .single();

      if (donationError) throw donationError;

      // Create inventory entry
      const collectionDate = new Date(formData.donation_timestamp);
      const expiryDate = new Date(collectionDate);
      expiryDate.setDate(expiryDate.getDate() + 42); // Blood expires in 42 days

      const { error: inventoryError } = await supabase
        .from('inventory')
        .insert([{
          donation_id: donationData.donation_id,
          hospital_id: hospitalId,
          number_of_units: 1,
          collection_ts: formData.donation_timestamp,
          expiry_ts: expiryDate.toISOString(),
          status: 'Available',
          notes: 'Auto-created from donation',
        }]);

      if (inventoryError) throw inventoryError;

      setSuccess('Donation recorded successfully and added to inventory!');
      
      // Reset form
      setFormData({
        donor_id: '',
        donation_timestamp: new Date().toISOString().slice(0, 16),
        quantity_ml: '450',
        hemoglobin_level: '',
        notes: '',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/hospital/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error adding donation:', err);
      setError(err.message || 'Failed to add donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDonor = donors.find(d => d.donor_id === formData.donor_id);

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
              <span className="text-xl">💉</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Record New Donation</h1>
              <p className="text-purple-100 text-xs md:text-sm">{hospitalName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donor Selection */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200">
                Donor Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Donor *
                  </label>
                  {loadingDonors ? (
                    <div className="text-gray-500 text-sm">Loading donors...</div>
                  ) : (
                    <select
                      name="donor_id"
                      value={formData.donor_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                      required
                    >
                      <option value="">-- Select a donor --</option>
                      {donors.map(donor => (
                        <option key={donor.donor_id} value={donor.donor_id}>
                          {donor.last_name}, {donor.first_name} ({donor.abo_group}{donor.rh_factor})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedDonor && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">👤</span>
                      <span className="font-bold text-gray-800">
                        {selectedDonor.first_name} {selectedDonor.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🩸</span>
                      <span className="font-bold text-red-600">
                        Blood Type: {selectedDonor.abo_group}{selectedDonor.rh_factor}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Donation Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200">
                Donation Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Donation Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="donation_timestamp"
                    value={formData.donation_timestamp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity (ml) *
                  </label>
                  <input
                    type="number"
                    name="quantity_ml"
                    value={formData.quantity_ml}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hemoglobin Level (g/dL)
                  </label>
                  <input
                    type="number"
                    name="hemoglobin_level"
                    value={formData.hemoglobin_level}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    placeholder="e.g., 13.5"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                placeholder="Any additional information..."
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-xl">ℹ️</span>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Auto-Inventory Creation</p>
                  <p>This donation will be automatically added to your inventory with a 42-day expiry period.</p>
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
                    Recording Donation...
                  </span>
                ) : (
                  '➕ Record Donation'
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
