'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type LoginMode = 'select' | 'admin' | 'hospital';

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('select');
  const [password, setPassword] = useState('');
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password === 'thatoe') {
      const userInfo = { role: 'admin' };
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('bloodbank_auth', 'true');
      localStorage.setItem('bloodbank_user', JSON.stringify(userInfo));
      router.push('/menu');
    } else {
      setError('Incorrect password. Please try again.');
      setLoading(false);
    }
  };

  const handleHospitalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate passkey against database
      const { data: hospital, error: dbError } = await supabase
        .from('hospitals')
        .select('hospital_id, name, passkey')
        .eq('passkey', passkey)
        .single();

      if (dbError || !hospital) {
        setError('Invalid passkey. Please check and try again.');
        setLoading(false);
        return;
      }

      // Store hospital authentication info
      const userInfo = { 
        role: 'hospital', 
        hospitalId: hospital.hospital_id,
        hospitalName: hospital.name
      };
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('bloodbank_auth', 'true');
      localStorage.setItem('bloodbank_user', JSON.stringify(userInfo));
      localStorage.setItem('hospital_name', hospital.name);
      
      router.push('/hospital/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-pink-500 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Login Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md animate-fade-in-up">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mb-4 shadow-lg animate-blood-drop">
            <span className="text-4xl md:text-5xl">🩸</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Blood Bank System
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            Inventory Management Portal
          </p>
        </div>

        {/* Mode Selection */}
        {mode === 'select' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome</h2>
              <p className="text-gray-600 text-sm">Please select your login type</p>
            </div>

            <button
              onClick={() => setMode('admin')}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-red-700 hover:to-pink-700 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <span className="text-2xl">👨‍💼</span>
              <span>Sign in as Administrator</span>
            </button>

            <button
              onClick={() => setMode('hospital')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🏥</span>
              <span>Sign in as Hospital</span>
            </button>
          </div>
        )}

        {/* Admin Login Form */}
        {mode === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <button
              type="button"
              onClick={() => { setMode('select'); setError(''); setPassword(''); }}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 mb-4"
            >
              <span>←</span> Back to selection
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Administrator Login</h2>
              <p className="text-gray-600 text-sm">Enter your admin password</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 outline-none"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔒
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2 animate-slide-in">
                <span className="text-red-600">❌</span>
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-700 hover:to-pink-700 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In as Admin'
              )}
            </button>
          </form>
        )}

        {/* Hospital Login Form */}
        {mode === 'hospital' && (
          <form onSubmit={handleHospitalLogin} className="space-y-6">
            <button
              type="button"
              onClick={() => { setMode('select'); setError(''); setPasskey(''); }}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 mb-4"
            >
              <span>←</span> Back to selection
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Hospital Login</h2>
              <p className="text-gray-600 text-sm">Enter your hospital passkey</p>
            </div>

            <div>
              <label htmlFor="passkey" className="block text-sm font-semibold text-gray-700 mb-2">
                Hospital Passkey
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="passkey"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter hospital passkey"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔑
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Contact your administrator if you don't have a passkey</p>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2 animate-slide-in">
                <span className="text-red-600">❌</span>
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In as Hospital'
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <span className="animate-heartbeat">💝</span>
            Saving Lives Together
          </p>
          <p className="text-xs text-gray-400 mt-1">© 2025 Blood Bank System</p>
        </div>
      </div>
    </div>
  );
}
