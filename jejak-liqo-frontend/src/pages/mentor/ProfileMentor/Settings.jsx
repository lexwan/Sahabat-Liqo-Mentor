import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, Moon, Sun, Edit, Save, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { logout } from '../../../api/auth';
import Layout from '../../../components/mentor/Layout';
import LogoutConfirmModal from '../../../components/ui/LogoutConfirmModal';
import toast from 'react-hot-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});

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
        setEditData({
          name: data.data.profile?.name || '',
          nickname: data.data.profile?.nickname || '',
          phone_number: data.data.profile?.phone_number || '',
          job: data.data.profile?.job || '',
          address: data.data.profile?.address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: profile.profile?.name || '',
      nickname: profile.profile?.nickname || '',
      phone_number: profile.profile?.phone_number || '',
      job: profile.profile?.job || '',
      address: profile.profile?.address || ''
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mentor/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setProfile(data.data);
        setIsEditing(false);
        const toastId = toast.success('Profile berhasil diperbarui', { duration: 2000 });
        setTimeout(() => toast.dismiss(toastId), 2000);
      } else {
        throw new Error(data.message || 'Gagal memperbarui profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const toastId = toast.error('Gagal memperbarui profile', { duration: 2000 });
      setTimeout(() => toast.dismiss(toastId), 2000);
    } finally {
      setSaving(false);
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
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nama Lengkap</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{profile.profile?.name || 'Tidak ada data'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</p>
                    <p className="text-gray-900 dark:text-white">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nama Panggilan</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.nickname}
                        onChange={(e) => setEditData({...editData, nickname: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{profile.profile?.nickname || 'Tidak ada data'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Jenis Kelamin</p>
                    <p className="text-gray-900 dark:text-white">{profile.profile?.gender || 'Tidak ada data'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No. Telepon</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.phone_number}
                        onChange={(e) => setEditData({...editData, phone_number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{profile.profile?.phone_number || 'Tidak ada data'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pekerjaan</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.job}
                        onChange={(e) => setEditData({...editData, job: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{profile.profile?.job || 'Tidak ada data'}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Alamat</p>
                    {isEditing ? (
                      <textarea
                        value={editData.address}
                        onChange={(e) => setEditData({...editData, address: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{profile.profile?.address || 'Tidak ada data'}</p>
                    )}
                  </div>
                </div>
                
                {isEditing ? (
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center"
                    >
                      <Save size={16} className="mr-2" />
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center"
                    >
                      <X size={16} className="mr-2" />
                      Batal
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleEdit}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Gagal memuat data profile</p>
            )}
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