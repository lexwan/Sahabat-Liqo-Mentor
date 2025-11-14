import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../../components/mentor/Layout";
import { getMentorGroups, getTrashedGroups, restoreGroup, createMentorGroup } from "../../api/mentor";
import { User, Calendar, RotateCcw, Trash2, Plus, X } from "lucide-react";

const MentorDashboard = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [trashedGroups, setTrashedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrashed, setShowTrashed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ group_name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchMentorGroups();
    fetchTrashedGroups();
  }, []);

  const fetchMentorGroups = async () => {
    try {
      setLoading(true);
      const response = await getMentorGroups();
      setGroups(response.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Gagal memuat data kelompok');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashedGroups = async () => {
    try {
      const response = await getTrashedGroups();
      setTrashedGroups(response.data || []);
    } catch (error) {
      console.error('Error fetching trashed groups:', error);
      setTrashedGroups([]);
    }
  };

  const handleGroupClick = (groupId) => {
    navigate(`/mentor/kelompok/${groupId}`);
  };

  const handleRestoreGroup = async (groupId, groupName) => {
    toast((t) => (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-3">
          <span className="font-medium text-gray-900 dark:text-white">
            Pulihkan {groupName}?
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Kelompok akan dipulihkan dan dapat diakses kembali.
          </span>
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                confirmRestoreGroup(groupId, groupName);
              }}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
            >
              Ya, Pulihkan
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
      style: {
        background: 'transparent',
        boxShadow: 'none'
      }
    });
  };

  const confirmRestoreGroup = async (groupId, groupName) => {
    try {
      await restoreGroup(groupId);
      const toastId = toast.success(`${groupName} berhasil dipulihkan`, { duration: 2000 });
      setTimeout(() => toast.dismiss(toastId), 2000);
      fetchMentorGroups();
      fetchTrashedGroups();
    } catch (error) {
      console.error('Error restoring group:', error);
      const toastId = toast.error('Gagal memulihkan kelompok', { duration: 2000 });
      setTimeout(() => toast.dismiss(toastId), 2000);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!formData.group_name.trim()) {
      toast.error('Nama kelompok harus diisi');
      return;
    }

    try {
      setCreating(true);
      await createMentorGroup(formData);
      const toastId = toast.success('Kelompok berhasil dibuat', { duration: 2000 });
      setTimeout(() => toast.dismiss(toastId), 2000);
      setShowCreateModal(false);
      setFormData({ group_name: '', description: '' });
      fetchMentorGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      const toastId = toast.error('Gagal membuat kelompok', { duration: 2000 });
      setTimeout(() => toast.dismiss(toastId), 2000);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {showTrashed ? 'Kelompok Terhapus' : 'Daftar Kelompok'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {showTrashed 
                  ? 'Kelompok yang telah dihapus dan dapat dipulihkan.' 
                  : 'Kelola dan pantau aktivitas kelompok mentoring Anda.'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {!showTrashed && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center text-sm"
                >
                  <Plus size={16} className="mr-2" />
                  Tambah Kelompok
                </button>
              )}
              <button
                onClick={() => setShowTrashed(!showTrashed)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors flex-shrink-0 ${
                  showTrashed 
                    ? 'bg-green-500 hover:bg-green-600 text-white border border-green-500'
                    : 'bg-red-500 hover:bg-red-600 text-white border border-red-500'
                }`}
              >
                {showTrashed ? 'Lihat Kelompok Aktif' : `Kelompok Terhapus (${trashedGroups.length})`}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : showTrashed ? (
          trashedGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trashedGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {group.group_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                        {group.mentor?.profile?.full_name || 'Mentor'}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                        Terhapus
                      </span>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {group.mentor?.profile?.profile_picture ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/storage/${group.mentor.profile.profile_picture}`}
                          alt={group.mentor.profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-white" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Calendar size={16} className="mr-2" />
                      <span>Dihapus {formatDate(group.deleted_at)}</span>
                    </div>
                    <button
                      onClick={() => handleRestoreGroup(group.id, group.group_name)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Pulihkan Kelompok"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Tidak Ada Kelompok Terhapus
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Semua kelompok masih aktif.
              </p>
            </div>
          )
        ) : groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleGroupClick(group.id)}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {group.group_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                      {group.mentor?.profile?.full_name || 'Mentor'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {group.mentor?.profile?.profile_picture ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/storage/${group.mentor.profile.profile_picture}`}
                        alt={group.mentor.profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-white" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Calendar size={16} className="mr-2" />
                  <span>Dibuat {formatDate(group.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Belum Ada Kelompok
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Anda belum memiliki kelompok mentoring.
            </p>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tambah Kelompok Baru
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ group_name: '', description: '' });
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateGroup} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Kelompok *
                    </label>
                    <input
                      type="text"
                      value={formData.group_name}
                      onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Masukkan nama kelompok"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Masukkan deskripsi kelompok (opsional)"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ group_name: '', description: '' });
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                  >
                    {creating ? 'Membuat...' : 'Buat Kelompok'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MentorDashboard;