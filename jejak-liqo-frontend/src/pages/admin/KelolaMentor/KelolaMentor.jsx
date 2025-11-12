import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Layout from '../../../components/admin/Layout';
import { Plus, Search, Edit, Trash2, Users, Info, UserCheck, UserX, Shield, ShieldOff, ChevronLeft, ChevronRight, RotateCcw, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { mentorAPI } from '../../../utils/api';

const KelolaMentor = () => {
  const { isDark } = useTheme();
  const [mentors, setMentors] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showForceDeleteModal, setShowForceDeleteModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    gender: '',
    address: '',
    birth_date: '',
    password: ''
  });

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMentors();
    }, 300);
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, activeTab, currentPage]);

  // Reset page when changing tabs or search
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const fetchMentors = async () => {
    try {
      const params = {
        page: currentPage,
        per_page: 15
      };
      if (searchTerm) params.search = searchTerm;
      
      const response = activeTab === 'active' 
        ? await mentorAPI.getList(params)
        : await mentorAPI.getTrashed(params);
      const data = response.data;
      
      setMentors(data.data || []);
      setPagination(data.meta || {});
      if (activeTab === 'active') {
        setStats({
          total: data.stats?.totalMentors || 0,
          active: data.stats?.activeMentors || 0,
          blocked: data.stats?.blockedMentors || 0,
          trashed: data.stats?.trashedMentors || 0,
          ikhwan: data.stats?.ikhwanCount || 0,
          akhwat: data.stats?.akhwatCount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Gagal memuat data mentor');
      setMentors([]);
      setStats({ total: 0, active: 0, blocked: 0, trashed: 0, ikhwan: 0, akhwat: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.gender) {
      toast.error('Nama lengkap, email, dan gender wajib diisi');
      return;
    }
    
    try {
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([, value]) => value !== '' && value !== null)
      );
      
      const response = await mentorAPI.create(cleanData);
      toast.success(response.data?.message || 'Mentor berhasil ditambahkan');
      setShowAddModal(false);
      setFormData({ full_name: '', email: '', phone_number: '', gender: '', address: '', birth_date: '', password: '' });
      fetchMentors();
    } catch (error) {
      console.error('Error adding mentor:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menambahkan mentor';
      toast.error(errorMessage);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.gender) {
      toast.error('Nama lengkap, email, dan gender wajib diisi');
      return;
    }
    
    try {
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([, value]) => value !== '' && value !== null)
      );
      
      const response = await mentorAPI.update(selectedMentor.id, cleanData);
      toast.success(response.data?.message || 'Mentor berhasil diperbarui');
      setShowEditModal(false);
      setSelectedMentor(null);
      fetchMentors();
    } catch (error) {
      console.error('Error updating mentor:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memperbarui mentor';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await mentorAPI.delete(selectedMentor.id);
      toast.success(response.data?.message || 'Mentor berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedMentor(null);
      fetchMentors();
    } catch (error) {
      console.error('Error deleting mentor:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menghapus mentor';
      toast.error(errorMessage);
    }
  };

  const handleBlock = async () => {
    try {
      const response = await mentorAPI.block(selectedMentor.id);
      toast.success(response.data?.message || 'Mentor berhasil diblokir');
      setShowBlockModal(false);
      setSelectedMentor(null);
      setBlockReason('');
      fetchMentors();
    } catch (error) {
      console.error('Error blocking mentor:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memblokir mentor';
      toast.error(errorMessage);
    }
  };

  const handleUnblock = async (mentor) => {
    try {
      const response = await mentorAPI.unblock(mentor.id);
      toast.success(response.data?.message || 'Mentor berhasil dibuka blokir');
      fetchMentors();
    } catch (error) {
      console.error('Error unblocking mentor:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal membuka blokir mentor';
      toast.error(errorMessage);
    }
  };

  const handleRestore = async () => {
    try {
      const response = await mentorAPI.restore(selectedMentor.id);
      toast.success(response.data?.message || 'Mentor berhasil dipulihkan');
      setShowRestoreModal(false);
      setSelectedMentor(null);
      fetchMentors();
    } catch (error) {
      console.error('Error restoring mentor:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memulihkan mentor';
      toast.error(errorMessage);
    }
  };

  const handleForceDelete = async () => {
    try {
      const response = await mentorAPI.forceDelete(selectedMentor.id);
      toast.success(response.data?.message || 'Mentor berhasil dihapus permanen');
      setShowForceDeleteModal(false);
      setSelectedMentor(null);
      fetchMentors();
    } catch (error) {
      console.error('Error force deleting mentor:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menghapus permanen mentor';
      toast.error(errorMessage);
    }
  };

  const openEditModal = async (mentor) => {
    try {
      setSelectedMentor(mentor);
      const response = await mentorAPI.getEditData(mentor.id);
      const editData = response.data.data;
      
      setFormData({
        full_name: editData.profile?.full_name || editData.full_name || '',
        email: editData.email || '',
        phone_number: editData.profile?.phone_number || editData.phone_number || '',
        gender: editData.profile?.gender || editData.gender || '',
        address: editData.profile?.address || editData.address || '',
        birth_date: editData.profile?.birth_date || editData.birth_date || '',
        password: ''
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Error loading edit data:', error);
      // Fallback to current data if API fails
      setFormData({
        full_name: mentor.profile?.full_name || '',
        email: mentor.email || '',
        phone_number: mentor.profile?.phone_number || '',
        gender: mentor.profile?.gender || '',
        address: mentor.profile?.address || '',
        birth_date: mentor.profile?.birth_date || '',
        password: ''
      });
      setShowEditModal(true);
    }
  };

  const openDeleteModal = (mentor) => {
    setSelectedMentor(mentor);
    setShowDeleteModal(true);
  };

  const openDetailModal = (mentor) => {
    setSelectedMentor(mentor);
    setShowDetailModal(true);
  };

  const openBlockModal = (mentor) => {
    setSelectedMentor(mentor);
    setShowBlockModal(true);
  };

  const openRestoreModal = (mentor) => {
    setSelectedMentor(mentor);
    setShowRestoreModal(true);
  };

  const openForceDeleteModal = (mentor) => {
    setSelectedMentor(mentor);
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

  return (
    <Layout activeMenu="Kelola Mentor">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Kelola Mentor
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Kelola data mentor dalam sistem
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              <Plus size={20} />
              <span>Tambah Mentor</span>
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
              placeholder="Cari mentor..."
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="text-green-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Mentor</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.total || 0}</p>
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserCheck className="text-blue-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Mentor Ikhwan</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.ikhwan || 0}</p>
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <UserX className="text-pink-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Mentor Akhwat</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.akhwat || 0}</p>
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Shield className="text-indigo-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Mentor Aktif</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.active || 0}</p>
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
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>No</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Mentor</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Email</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Gender</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Kontrol</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Aksi</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : mentors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tidak ada data mentor
                    </td>
                  </tr>
                ) : (
                  mentors.map((mentor, index) => (
                    <tr key={mentor.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {(pagination.from || 1) + index}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {mentor.profile?.full_name?.charAt(0).toUpperCase() || 'M'}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium">{mentor.profile?.full_name || 'Nama tidak tersedia'}</div>
                            <div className="text-sm text-gray-500">ID: {mentor.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {mentor.email}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mentor.profile?.gender?.toLowerCase() === 'ikhwan' 
                            ? 'bg-blue-100 text-blue-800' 
                            : mentor.profile?.gender?.toLowerCase() === 'akhwat'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {mentor.profile?.gender || '-'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap`}>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mentor.status === 'blocked' || mentor.blocked_at
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {mentor.status === 'blocked' || mentor.blocked_at ? 'Diblokir' : 'Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {activeTab === 'active' ? (
                          mentor.status === 'blocked' || mentor.blocked_at ? (
                            <button
                              onClick={() => handleUnblock(mentor)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                            >
                              <ShieldOff size={14} className="mr-1" />
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => openBlockModal(mentor)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                            >
                              <Shield size={14} className="mr-1" />
                              Block
                            </button>
                          )
                        ) : (
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Dihapus: {mentor.deleted_at ? new Date(mentor.deleted_at).toLocaleDateString('id-ID') : '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDetailModal(mentor)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Detail"
                          >
                            <Info size={18} />
                          </button>
                          {activeTab === 'active' ? (
                            <>
                              <button
                                onClick={() => openEditModal(mentor)}
                                className="text-yellow-600 hover:text-yellow-900 transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(mentor)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => openRestoreModal(mentor)}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Pulihkan"
                              >
                                <RotateCcw size={18} />
                              </button>
                              <button
                                onClick={() => openForceDeleteModal(mentor)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Hapus Permanen"
                              >
                                <Trash size={18} />
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
              
              {/* Page Numbers */}
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
      
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Tambah Mentor
              </h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  required
                />
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  required
                >
                  <option value="">Pilih Gender</option>
                  <option value="ikhwan">Ikhwan</option>
                  <option value="akhwat">Akhwat</option>
                </select>
                <input
                  type="tel"
                  placeholder="No HP"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Edit Mentor
              </h3>
              <form onSubmit={handleEdit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  required
                />
                <input
                  type="password"
                  placeholder="Password (kosongkan jika tidak diubah)"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  required
                >
                  <option value="">Pilih Gender</option>
                  <option value="ikhwan">Ikhwan</option>
                  <option value="akhwat">Akhwat</option>
                </select>
                <input
                  type="tel"
                  placeholder="No HP"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
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
      {showDetailModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Detail Mentor
              </h3>
              <div className="space-y-3">
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nama Lengkap</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentor.profile?.full_name || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Email</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentor.email}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No HP</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentor.profile?.phone_number || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Gender</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentor.profile?.gender || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedMentor.status === 'blocked' || selectedMentor.blocked_at
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedMentor.status === 'blocked' || selectedMentor.blocked_at ? 'Diblokir' : 'Aktif'}
                  </span>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Hapus Mentor
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin menghapus mentor <strong>{selectedMentor?.profile?.full_name}</strong>?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Blokir Mentor
              </h3>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin memblokir mentor <strong>{selectedMentor?.profile?.full_name}</strong>?
              </p>
              <textarea
                placeholder="Alasan pemblokiran..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-red-500`}
                rows="3"
                required
              />
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                >
                  Batal
                </button>
                <button
                  onClick={handleBlock}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Blokir
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
                Pulihkan Mentor
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin memulihkan mentor <strong>{selectedMentor?.profile?.full_name}</strong>?
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
                Apakah Anda yakin ingin menghapus permanen mentor <strong>{selectedMentor?.profile?.full_name}</strong>? 
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

export default KelolaMentor;