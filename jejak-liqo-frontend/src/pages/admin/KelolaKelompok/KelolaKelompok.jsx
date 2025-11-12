import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import DeleteGroupModal from '../../../components/DeleteGroupModal';
import { Plus, Search, Edit, Trash2, Users, Info, User, Heart, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { groupAPI } from '../../../utils/api';

const KelolaKelompok = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showForceDeleteModal, setShowForceDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    mentor_id: ''
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchGroups();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeTab, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const fetchGroups = async () => {
    try {
      const params = {
        page: currentPage,
        per_page: 10
      };
      if (searchTerm) params.search = searchTerm;
      
      const response = activeTab === 'active' 
        ? await groupAPI.getList(params)
        : await groupAPI.getTrashed(params);
      const data = response.data;
      
      const groupsData = data.data || [];
      setGroups(groupsData);
      setPagination(data.meta || {});
      if (activeTab === 'active') {
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Gagal memuat data kelompok');
      setGroups([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };



  const handleRestore = async () => {
    try {
      const response = await groupAPI.restore(selectedGroup.id);
      toast.success(response.data?.message || 'Kelompok berhasil dipulihkan');
      setShowRestoreModal(false);
      setSelectedGroup(null);
      fetchGroups();
    } catch (error) {
      console.error('Error restoring group:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memulihkan kelompok';
      toast.error(errorMessage);
    }
  };

  const handleForceDelete = async () => {
    try {
      const response = await groupAPI.forceDelete(selectedGroup.id);
      toast.success(response.data?.message || 'Kelompok berhasil dihapus permanen');
      setShowForceDeleteModal(false);
      setSelectedGroup(null);
      fetchGroups();
    } catch (error) {
      console.error('Error force deleting group:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menghapus permanen kelompok';
      toast.error(errorMessage);
    }
  };



  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([, value]) => value !== '' && value !== null)
      );
      
      const response = await groupAPI.update(selectedGroup.id, cleanData);
      toast.success(response.data?.message || 'Kelompok berhasil diperbarui');
      setShowEditModal(false);
      setSelectedGroup(null);
      fetchGroups();
    } catch (error) {
      console.error('Error updating group:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memperbarui kelompok';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await groupAPI.delete(selectedGroup.id);
      toast.success(response.data?.message || 'Kelompok berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedGroup(null);
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menghapus kelompok';
      toast.error(errorMessage);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const promises = selectedIds.map(id => groupAPI.delete(id));
      await Promise.all(promises);
      toast.success(`${selectedIds.length} kelompok berhasil dihapus`);
      setShowBulkDeleteModal(false);
      setSelectedIds([]);
      fetchGroups();
    } catch (error) {
      console.error('Error bulk deleting groups:', error);
      toast.error('Terjadi kesalahan saat menghapus');
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(groups.map(group => group.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setFormData({
      group_name: group.group_name || '',
      description: group.description || '',
      mentor_id: group.mentor?.id || ''
    });
    setShowEditModal(true);
  };

  const openRestoreModal = (group) => {
    setSelectedGroup(group);
    setShowRestoreModal(true);
  };

  const openForceDeleteModal = (group) => {
    setSelectedGroup(group);
    setShowForceDeleteModal(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pagination.last_page) {
      setCurrentPage(currentPage + 1);
    }
  };

  const openDeleteModal = (group) => {
    setSelectedGroup(group);
    setShowDeleteModal(true);
  };

  const openDetailModal = async (group) => {
    setSelectedGroup(group);
    
    // Fetch detailed group data with mentees
    try {
      const response = await groupAPI.getDetail(group.id);
      setSelectedGroup(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching group details:', error);
      // Use original group data if detail fetch fails
      setSelectedGroup(group);
    }
    
    setShowDetailModal(true);
  };

  return (
    <Layout activeMenu="Kelola Kelompok">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Kelola Kelompok
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Kelola data kelompok dalam sistem
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {selectedIds.length > 0 && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
              >
                <Trash2 size={20} />
                <span>Hapus ({selectedIds.length})</span>
              </button>
            )}

            <button
              onClick={() => navigate('/admin/kelola-kelompok/tambah')}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              <Plus size={20} />
              <span>Tambah Kelompok</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-green-500 text-white'
                : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setActiveTab('trashed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'trashed'
                ? 'bg-red-500 text-white'
                : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Terhapus
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
            <input
              type="text"
              placeholder="Cari kelompok..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
          </div>
        </div>

        {activeTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="text-green-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Kelompok</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.total_groups || 0}</p>
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="text-blue-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Kelompok Ikhwan</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.ikhwan_groups || 0}</p>
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <Heart className="text-pink-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Kelompok Akhwat</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.akhwat_groups || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === groups.length && groups.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>No</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Nama Kelompok</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Mentor</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Gender</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Jumlah Mentee</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Pertemuan</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {activeTab === 'trashed' ? 'Tanggal Dihapus' : 'Tanggal Dibuat'}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Aksi</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : groups.length === 0 ? (
                  <tr>
                    <td colSpan="9" className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tidak ada data kelompok
                    </td>
                  </tr>
                ) : (
                  groups.map((group, index) => (
                    <tr key={group.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {activeTab === 'active' ? (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(group.id)}
                            onChange={(e) => handleSelectOne(group.id, e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        ) : (
                          <span className="text-red-500">🗑️</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {(pagination.from || 1) + index}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div>
                          <div className="font-medium">{group.group_name}</div>
                          <div className="text-sm text-gray-500">{group.description || '-'}</div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <div className="font-medium">{group.mentor?.profile?.full_name || '-'}</div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap`}>
                        {(() => {
                          const mentorGender = group.mentor?.profile?.gender || group.mentor?.gender;
                          
                          if (mentorGender) {
                            const isIkhwan = mentorGender.toLowerCase() === 'ikhwan';
                            return (
                              <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                isIkhwan
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                                  : 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
                              }`}>
                                {isIkhwan ? 'Ikhwan' : 'Akhwat'}
                              </span>
                            );
                          }
                          return <span className={`text-gray-400`}>-</span>;
                        })()
                      }
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {group.mentees_count || 0} orang
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {group.meetings_count || 0} kali
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {activeTab === 'trashed' 
                          ? new Date(group.deleted_at).toLocaleDateString('id-ID')
                          : new Date(group.created_at).toLocaleDateString('id-ID')
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDetailModal(group)}
                            className="text-emerald-600 hover:text-emerald-900 transition-colors"
                            title="Detail"
                          >
                            <Info size={18} />
                          </button>
                          {activeTab === 'active' ? (
                            <>
                              <button
                                onClick={() => openEditModal(group)}
                                className="text-yellow-600 hover:text-yellow-900 transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(group)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => openRestoreModal(group)}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Pulihkan"
                              >
                                <RotateCcw size={18} />
                              </button>
                              <button
                                onClick={() => openForceDeleteModal(group)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Hapus Permanen"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className={`mt-6 flex items-center justify-between px-6 py-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Menampilkan {pagination.from || 0} - {pagination.to || 0} dari {pagination.total || 0} data
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                <ChevronLeft size={20} />
              </button>
              
              {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.last_page - 4, currentPage - 2)) + i;
                if (pageNum > pagination.last_page) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-green-500 text-white'
                        : isDark
                        ? 'text-gray-400 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === pagination.last_page}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === pagination.last_page
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>



      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Edit Kelompok
              </h3>
              <form onSubmit={handleEdit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nama Kelompok"
                  value={formData.group_name}
                  onChange={(e) => setFormData({...formData, group_name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  required
                />
                <textarea
                  placeholder="Deskripsi"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  rows="3"
                />
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-4xl rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Detail Kelompok
              </h3>
              
              {/* Informasi Kelompok */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nama Kelompok</label>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedGroup.group_name}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Gender</label>
                    <div className="mt-1">
                      {(() => {
                        const mentorGender = selectedGroup.mentor?.profile?.gender || selectedGroup.mentor?.gender;
                        if (!mentorGender) return <span className="text-gray-400">-</span>;
                        const isIkhwan = mentorGender.toLowerCase() === 'ikhwan';
                        return (
                          <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${
                            isIkhwan
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
                          }`}>
                            {isIkhwan ? 'Ikhwan' : 'Akhwat'}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Mentor</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedGroup.mentor?.profile?.full_name || '-'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Pertemuan</label>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedGroup.meetings_count || 0} kali</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Deskripsi</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedGroup.description || '-'}</p>
                  </div>
                </div>
              </div>
              
              {/* Daftar Mentee */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Daftar Mentee
                  </h4>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total: {selectedGroup.mentees_count || 0} orang
                  </span>
                </div>
                
                {selectedGroup.mentees && selectedGroup.mentees.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedGroup.mentees.map((mentee, index) => (
                      <div key={mentee.id || index} className={`p-4 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="font-medium mb-2">
                          <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {mentee.full_name || mentee.profile?.full_name || mentee.name}
                          </p>
                          {(mentee.nickname || mentee.profile?.nickname) && (
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              ({mentee.nickname || mentee.profile?.nickname})
                            </p>
                          )}
                        </div>
                        <div>
                          {(() => {
                            const menteeGender = mentee.gender || mentee.profile?.gender;
                            if (!menteeGender) return null;
                            const isIkhwan = menteeGender.toLowerCase() === 'ikhwan';
                            return (
                              <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                isIkhwan
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
                              }`}>
                                {isIkhwan ? 'Ikhwan' : 'Akhwat'}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>Belum ada mentee dalam kelompok ini</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-6 border-t mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteGroupModal
        groupId={selectedGroup?.id}
        groupName={selectedGroup?.group_name}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Hapus Kelompok
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin menghapus <strong>{selectedIds.length}</strong> kelompok yang dipilih?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                >
                  Batal
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Hapus Semua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Pulihkan Kelompok
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin memulihkan kelompok <strong>{selectedGroup?.group_name}</strong>?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                >
                  Batal
                </button>
                <button
                  onClick={handleRestore}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Pulihkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Force Delete Modal */}
      {showForceDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Hapus Permanen
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin menghapus permanen kelompok <strong>{selectedGroup?.group_name}</strong>? 
                <br /><span className="text-red-500 font-semibold">Data tidak dapat dipulihkan!</span>
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowForceDeleteModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                >
                  Batal
                </button>
                <button
                  onClick={handleForceDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default KelolaKelompok;