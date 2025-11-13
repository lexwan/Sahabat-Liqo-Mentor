import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Lock, Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { logout } from '../../../api/auth';
import Layout from '../../../components/mentor/Layout';
import LogoutConfirmModal from '../../../components/ui/LogoutConfirmModal';

const Settings = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mentor/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.setItem('showLogoutSuccessToast', 'true');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setShowLogoutModal(false);
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola pengaturan akun dan preferensi Anda
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <User size={20} className="mr-2" />
              Profile
            </h2>
            
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ) : profile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Lengkap</p>
                    <p className="text-gray-900 dark:text-white">{profile.profile?.name || 'Tidak ada data'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-white">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Panggilan</p>
                    <p className="text-gray-900 dark:text-white">{profile.profile?.nickname || 'Tidak ada data'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Jenis Kelamin</p>
                    <p className="text-gray-900 dark:text-white">{profile.profile?.gender || 'Tidak ada data'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No. Telepon</p>
                    <p className="text-gray-900 dark:text-white">{profile.profile?.phone_number || 'Tidak ada data'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pekerjaan</p>
                    <p className="text-gray-900 dark:text-white">{profile.profile?.job || 'Tidak ada data'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Alamat</p>
                    <p className="text-gray-900 dark:text-white">{profile.profile?.address || 'Tidak ada data'}</p>
                  </div>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Edit Profile
                </button>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Gagal memuat data profile</p>
            )}
          </div>

          {/* Security Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Lock size={20} className="mr-2" />
              Security
            </h2>
            <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Change Password
            </button>
          </div>

          {/* Preferences Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Bell size={20} className="mr-2" />
              Preferences
            </h2>
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Theme</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDark ? (
                  <>
                    <Sun size={16} />
                    <span className="text-sm">Light</span>
                  </>
                ) : (
                  <>
                    <Moon size={16} />
                    <span className="text-sm">Dark</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Logout Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <LogOut size={20} className="mr-2" />
              Account
            </h2>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </Layout>
  );
};

export default Settings;