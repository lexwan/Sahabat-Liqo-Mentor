import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Layout from '../../../components/admin/Layout';
import { Plus, Search, Edit, Trash2, Users, Info, UserCheck, UserX, RotateCcw, Trash, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { menteeAPI, groupAPI } from '../../../utils/api';

const KelolaMentee = () => {
  const { isDark } = useTheme();
  const [mentees, setMentees] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showForceDeleteModal, setShowForceDeleteModal] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    nickname: '',
    phone_number: '',
    gender: '',
    birth_date: '',
    activity_class: '',
    hobby: '',
    address: '',
    group_id: '',
    status: 'Aktif'
  });
  const [kelompoks, setKelompoks] = useState([]);

  useEffect(() => {
    fetchMentees();
    fetchKelompoks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMentees();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, activeTab, currentPage]);

  // Reset page when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchMentees = async () => {
    try {
      const params = {
        page: currentPage,
        per_page: 10
      };
      if (searchTerm) params.search = searchTerm;
      
      const response = activeTab === 'active' 
        ? await menteeAPI.getList(params)
        : await menteeAPI.getTrashed(params);
      const data = response.data;
      
      setMentees(data.data || []);
      setPagination(data.meta || {});
      if (activeTab === 'active') {
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching mentees:', error);
      toast.error('Gagal memuat data mentee');
    } finally {
      setLoading(false);
    }
  };

  const fetchKelompoks = async () => {
    try {
      // Try menteeAPI first, fallback to groupAPI
      let response;
      try {
        response = await menteeAPI.getFormOptions();
        console.log('Mentee form options response:', response.data);
      } catch (menteeError) {
        console.log('Mentee API failed, trying group API:', menteeError);
        response = await groupAPI.getFormOptions();
        console.log('Group form options response:', response.data);
      }
      
      const data = response.data;
      // Backend mengirim groups dengan opsi "Tanpa Kelompok"
      const groupsData = data.data?.groups || data.groups || [];
      console.log('Groups data:', groupsData);
      setKelompoks(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setKelompoks([]);
      toast.error('Gagal memuat data kelompok');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.full_name || !formData.gender) {
      toast.error('Nama lengkap dan gender wajib diisi');
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        group_id: formData.group_id === '' ? null : parseInt(formData.group_id)
      };
      
      const cleanData = Object.fromEntries(
        Object.entries(submitData).filter(([, value]) => value !== '' && value !== null)
      );
      
      const response = await menteeAPI.create(cleanData);
      toast.success(response.data?.message || 'Mentee berhasil ditambahkan');
      setShowAddModal(false);
      setFormData({ full_name: '', nickname: '', phone_number: '', gender: '', birth_date: '', activity_class: '', hobby: '', address: '', group_id: '', status: 'Aktif' });
      fetchMentees();
    } catch (error) {
      console.error('Error adding mentee:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menambahkan mentee';
      toast.error(errorMessage);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.full_name || !formData.gender) {
      toast.error('Nama lengkap dan gender wajib diisi');
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        group_id: formData.group_id === '' ? null : parseInt(formData.group_id)
      };
      
      const cleanData = Object.fromEntries(
        Object.entries(submitData).filter(([, value]) => value !== '' && value !== null)
      );
      
      const response = await menteeAPI.update(selectedMentee.id, cleanData);
      toast.success(response.data?.message || 'Mentee berhasil diperbarui');
      setShowEditModal(false);
      setSelectedMentee(null);
      fetchMentees();
    } catch (error) {
      console.error('Error updating mentee:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memperbarui mentee';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await menteeAPI.delete(selectedMentee.id);
      toast.success(response.data?.message || 'Mentee berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedMentee(null);
      fetchMentees();
    } catch (error) {
      console.error('Error deleting mentee:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menghapus mentee';
      toast.error(errorMessage);
    }
  };

  const handleRestore = async () => {
    try {
      const response = await menteeAPI.restore(selectedMentee.id);
      toast.success(response.data?.message || 'Mentee berhasil dipulihkan');
      setShowRestoreModal(false);
      setSelectedMentee(null);
      fetchMentees();
    } catch (error) {
      console.error('Error restoring mentee:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memulihkan mentee';
      toast.error(errorMessage);
    }
  };

  const handleForceDelete = async () => {
    try {
      const response = await menteeAPI.forceDelete(selectedMentee.id);
      toast.success(response.data?.message || 'Mentee berhasil dihapus permanen');
      setShowForceDeleteModal(false);
      setSelectedMentee(null);
      fetchMentees();
    } catch (error) {
      console.error('Error force deleting mentee:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menghapus mentee';
      toast.error(errorMessage);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const promises = selectedIds.map(id => menteeAPI.delete(id));
      await Promise.all(promises);
      toast.success(`${selectedIds.length} mentee berhasil dihapus`);
      setShowBulkDeleteModal(false);
      setSelectedIds([]);
      fetchMentees();
    } catch (error) {
      console.error('Error bulk deleting mentees:', error);
      toast.error('Terjadi kesalahan saat menghapus');
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(mentees.map(mentee => mentee.id));
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

  const openEditModal = async (mentee) => {
    try {
      setSelectedMentee(mentee);
      const response = await menteeAPI.getEditData(mentee.id);
      const editData = response.data.data;
      
      // Map gender to lowercase to match option values
      const genderValue = editData.gender ? editData.gender.toLowerCase() : '';
      
      setFormData({
        full_name: editData.full_name || '',
        nickname: editData.nickname || '',
        phone_number: editData.phone_number || '',
        gender: genderValue,
        birth_date: editData.birth_date || '',
        activity_class: editData.activity_class || '',
        hobby: editData.hobby || '',
        address: editData.address || '',
        group_id: editData.group?.id || editData.group_id || '',
        status: editData.status || 'Aktif'
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Error loading edit data:', error);
      // Fallback to current data if API fails
      const fallbackGender = mentee.gender ? mentee.gender.toLowerCase() : '';
      setFormData({
        full_name: mentee.full_name || '',
        nickname: mentee.nickname || '',
        phone_number: mentee.phone_number || '',
        gender: fallbackGender,
        birth_date: mentee.birth_date || '',
        activity_class: mentee.activity_class || '',
        hobby: mentee.hobby || '',
        address: mentee.address || '',
        group_id: mentee.group?.id || '',
        status: mentee.status || 'Aktif'
      });
      setShowEditModal(true);
    }
  };

  const openDeleteModal = (mentee) => {
    setSelectedMentee(mentee);
    setShowDeleteModal(true);
  };

  const openRestoreModal = (mentee) => {
    setSelectedMentee(mentee);
    setShowRestoreModal(true);
  };

  const openForceDeleteModal = (mentee) => {
    setSelectedMentee(mentee);
    setShowForceDeleteModal(true);
  };

  const openDetailModal = (mentee) => {
    setSelectedMentee(mentee);
    setShowDetailModal(true);
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

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <Layout activeMenu="Kelola Mentee">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Kelola Mentee
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Kelola data mentee dalam sistem
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
              onClick={() => {
                setFormData({
                  full_name: '',
                  nickname: '',
                  phone_number: '',
                  gender: '',
                  birth_date: '',
                  activity_class: '',
                  hobby: '',
                  address: '',
                  group_id: '',
                  status: 'Aktif'
                });
                setShowAddModal(true);
              }}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              <Plus size={20} />
              <span>Tambah Mentee</span>
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
              placeholder="Cari mentee..."
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
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Mentee</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.total_active || 0}/{ stats.total_all|| 0}</p>
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <UserCheck className="text-emerald-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Mentee Ikhwan</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.ikhwan_active  || 0}/{stats.ikhwan_total || 0}</p>
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <UserX className="text-pink-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Mentee Akhwat</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.akhwat_active  || 0}/{stats.akhwat_total || 0}</p>
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
                      checked={selectedIds.length === mentees.length && mentees.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>No</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Nama</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Gender</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Kelompok</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Telepon</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Aksi</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : mentees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tidak ada data mentee
                    </td>
                  </tr>
                ) : (
                  mentees.map((mentee, index) => (
                    <tr key={mentee.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(mentee.id)}
                          onChange={(e) => handleSelectOne(mentee.id, e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {index + 1}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div>
                          <div className="font-medium">{mentee.full_name}</div>
                          <div className="text-sm text-gray-500">{mentee.nickname}</div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {mentee.gender || '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <div>
                          {mentee.group ? (
                            <>
                              <div className="font-medium">{mentee.group.group_name}</div>
                              <div className="text-sm text-gray-500">{mentee.group.mentor?.profile?.full_name || '-'}</div>
                            </>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              Tanpa Kelompok
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {mentee.phone_number || '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap`}>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mentee.status === 'Aktif' 
                            ? 'bg-green-100 text-green-800' 
                            : mentee.status === 'Non-Aktif'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {mentee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDetailModal(mentee)}
                            className="text-emerald-600 hover:text-emerald-900 transition-colors"
                            title="Detail"
                          >
                            <Info size={18} />
                          </button>
                          {activeTab === 'active' ? (
                            <>
                              <button
                                onClick={() => openEditModal(mentee)}
                                className="text-yellow-600 hover:text-yellow-900 transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(mentee)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => openRestoreModal(mentee)}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Pulihkan"
                              >
                                <RotateCcw size={18} />
                              </button>
                              <button
                                onClick={() => openForceDeleteModal(mentee)}
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Tambah Mentee
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
                  type="text"
                  placeholder="Nama Panggilan"
                  value={formData.nickname}
                  onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <input
                  type="date"
                  placeholder="Tanggal Lahir"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <input
                  type="tel"
                  placeholder="No HP"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <input
                  type="text"
                  placeholder="Kelas Aktivitas"
                  value={formData.activity_class}
                  onChange={(e) => setFormData({...formData, activity_class: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <input
                  type="text"
                  placeholder="Hobi"
                  value={formData.hobby}
                  onChange={(e) => setFormData({...formData, hobby: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <textarea
                  placeholder="Alamat"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  rows="2"
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
                <select
                  value={formData.group_id}
                  onChange={(e) => setFormData({...formData, group_id: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                >
                  {kelompoks.map(kelompok => (
                    <option key={kelompok.id || 'no-group'} value={kelompok.value || ''}>
                      {kelompok.label}
                    </option>
                  ))}
                </select>
                <small className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1 block`}>
                  Pilih "Tanpa Kelompok" jika mentee belum memiliki kelompok
                </small>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                  <option value="Lulus">Lulus</option>
                </select>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        full_name: '',
                        nickname: '',
                        phone_number: '',
                        gender: '',
                        birth_date: '',
                        activity_class: '',
                        hobby: '',
                        address: '',
                        group_id: '',
                        status: 'Aktif'
                      });
                    }}
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
                Edit Mentee
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
                  type="text"
                  placeholder="Nama Panggilan"
                  value={formData.nickname}
                  onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <input
                  type="date"
                  placeholder="Tanggal Lahir"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <input
                  type="tel"
                  placeholder="No HP"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <input
                  type="text"
                  placeholder="Kelas Aktivitas"
                  value={formData.activity_class}
                  onChange={(e) => setFormData({...formData, activity_class: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <input
                  type="text"
                  placeholder="Hobi"
                  value={formData.hobby}
                  onChange={(e) => setFormData({...formData, hobby: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <textarea
                  placeholder="Alamat"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  rows="2"
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
                <select
                  value={formData.group_id}
                  onChange={(e) => setFormData({...formData, group_id: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                >
                  {kelompoks.map(kelompok => (
                    <option key={kelompok.id || 'no-group'} value={kelompok.value || ''}>
                      {kelompok.label}
                    </option>
                  ))}
                </select>
                <small className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1 block`}>
                  Pilih "Tanpa Kelompok" jika mentee belum memiliki kelompok
                </small>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                  <option value="Lulus">Lulus</option>
                </select>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedMentee(null);
                      setFormData({
                        full_name: '',
                        nickname: '',
                        phone_number: '',
                        gender: '',
                        birth_date: '',
                        activity_class: '',
                        hobby: '',
                        address: '',
                        group_id: '',
                        status: 'Aktif'
                      });
                    }}
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
      {showDetailModal && selectedMentee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Detail Mentee
              </h3>
              <div className="space-y-3">
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nama Lengkap</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.full_name}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nama Panggilan</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.nickname || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Tanggal Lahir</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.birth_date ? new Date(selectedMentee.birth_date).toLocaleDateString('id-ID') : '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No HP</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.phone_number || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Kelas Aktivitas</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.activity_class || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Gender</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.gender || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Hobi</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.hobby || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Alamat</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.address || '-'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Kelompok</label>
                  {selectedMentee.group ? (
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMentee.group.group_name}</p>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                      Tanpa Kelompok
                    </span>
                  )}
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedMentee.status === 'Aktif' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedMentee.status === 'Non-Aktif'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedMentee.status}
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
                Hapus Mentee
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin menghapus mentee <strong>{selectedMentee?.full_name}</strong>?
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

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Hapus Mentee
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin menghapus <strong>{selectedIds.length}</strong> mentee yang dipilih?
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
                Pulihkan Mentee
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin memulihkan mentee <strong>{selectedMentee?.full_name}</strong>?
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
                Apakah Anda yakin ingin menghapus permanen mentee <strong>{selectedMentee?.full_name}</strong>? 
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

export default KelolaMentee;