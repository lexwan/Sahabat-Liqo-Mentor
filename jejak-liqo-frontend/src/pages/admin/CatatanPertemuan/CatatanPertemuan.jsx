import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import Layout from '../../../components/admin/Layout';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { meetingAPI } from '../../../utils/api';

const CatatanPertemuan = () => {
  const { isDark } = useTheme();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    group_id: '',
    mentor_id: '',
    meeting_date: '',
    place: '',
    topic: '',
    notes: '',
    meeting_type: ''
  });
  const [groups, setGroups] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [filters, setFilters] = useState({
    meeting_type: '',
    mentor_id: '',
    group_id: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0
  });

  useEffect(() => {
    fetchRecords();
    fetchGroups();
    fetchMentors();
  }, [pagination.current_page, filters]);

  const fetchRecords = async () => {
    try {
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(filters.meeting_type && { meeting_type: filters.meeting_type }),
        ...(filters.mentor_id && { mentor_id: filters.mentor_id }),
        ...(filters.group_id && { group_id: filters.group_id }),
        ...(searchTerm && { search: searchTerm })
      };
      const response = await meetingAPI.getMeetings(params);
      const data = response.data;
      setRecords(data.data?.data || []);
      setPagination(prev => ({ ...prev, total: data.data?.total || 0 }));
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Gagal memuat data catatan');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/kelompoks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/mentors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMentors(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await meetingAPI.createMeeting(formData);
      toast.success('Catatan berhasil dibuat');
      setShowAddModal(false);
      setFormData({ group_id: '', mentor_id: '', meeting_date: '', place: '', topic: '', notes: '', meeting_type: '' });
      fetchRecords();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal membuat catatan');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await meetingAPI.updateMeeting(selectedRecord.id, formData);
      toast.success('Catatan berhasil diperbarui');
      setShowEditModal(false);
      setSelectedRecord(null);
      fetchRecords();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal memperbarui catatan');
    }
  };

  const handleDelete = async () => {
    try {
      await meetingAPI.deleteMeeting(selectedRecord.id);
      toast.success('Catatan berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedRecord(null);
      fetchRecords();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menghapus catatan');
    }
  };

  const filteredRecords = records.filter(item =>
    item.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mentor?.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.group?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate current week (Monday to Sunday) range and totals
  const getWeekRange = () => {
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) - 6 (Sat)
    // Compute Monday
    const diffToMonday = day === 0 ? -6 : 1 - day; // if Sunday, go back 6 days; else 1 - day
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
  };

  const { monday, sunday } = getWeekRange();

  const totalThisWeek = records.filter((item) => {
    const d = new Date(item.meeting_date);
    return d >= monday && d <= sunday;
  }).length;

  const openEditModal = (item) => {
    setSelectedRecord(item);
    setFormData({
      group_id: item.group?.id || '',
      mentor_id: item.mentor?.id || '',
      meeting_date: item.meeting_date || '',
      place: item.place || '',
      topic: item.topic || '',
      notes: item.notes || '',
      meeting_type: item.meeting_type || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (item) => {
    setSelectedRecord(item);
    setShowDeleteModal(true);
  };

  const openDetailModal = (item) => {
    setSelectedRecord(item);
    setShowDetailModal(true);
  };

  const getMeetingTypeBadge = (type) => {
    const badges = {
      'Online': 'bg-blue-100 text-blue-800 border-blue-200',
      'Offline': 'bg-green-100 text-green-800 border-green-200',
      'Assignment': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return badges[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Layout activeMenu="Kelola Pertemuan">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
              Catatan Pertemuan
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manajemen catatan pertemuan, tampilan diselaraskan dengan Kelola Laporan
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-[#4DABFF] to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <Plus size={20} />
              <span>Catat Pertemuan</span>
            </button>
          </div>
        </div>

        {/* Weekly Summary Card */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Total Laporan Minggu Ini (Senin - Minggu)</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{totalThisWeek}</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                {monday.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                {' - '}
                {sunday.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              🗓️
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className={isDark ? 'text-white' : 'text-gray-800'} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Filter & Pencarian</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
              <input
                type="text"
                placeholder="Cari catatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>

            <select
              value={filters.meeting_type}
              onChange={(e) => setFilters(prev => ({ ...prev, meeting_type: e.target.value }))}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">Semua Tipe</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Assignment">Assignment</option>
            </select>

            <select
              value={filters.group_id}
              onChange={(e) => setFilters(prev => ({ ...prev, group_id: e.target.value }))}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">Semua Kelompok</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>

            <select
              value={filters.mentor_id}
              onChange={(e) => setFilters(prev => ({ ...prev, mentor_id: e.target.value }))}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">Semua Mentor</option>
              {mentors.map(mentor => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.profile?.full_name || mentor.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}
        >
          <div className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Daftar Catatan Pertemuan</h3>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Kelompok</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Mentor</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Topik Pembahasan</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tanggal</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tipe Pertemuan</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.length === 0 && (
                        <tr>
                          <td colSpan={7} className={`py-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Tidak ada data
                          </td>
                        </tr>
                      )}
                      {filteredRecords.map((item, index) => (
                        <tr key={item.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{(pagination.current_page - 1) * pagination.per_page + index + 1}</td>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.group?.name || '-'}</td>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.mentor?.profile?.full_name || '-'}</td>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.topic}</td>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{new Date(item.meeting_date).toLocaleDateString('id-ID')}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getMeetingTypeBadge(item.meeting_type)}`}>
                              {item.meeting_type}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openDetailModal(item)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Lihat Detail"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1 text-yellow-600 hover:bg-yellow-100 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(item)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} data
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current_page: Math.max(1, prev.current_page - 1) }))}
                      disabled={pagination.current_page === 1}
                      className={`px-3 py-1 rounded border ${pagination.current_page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
                    >
                      Prev
                    </button>
                    <span className={`px-3 py-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {pagination.current_page}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                      disabled={pagination.current_page * pagination.per_page >= pagination.total}
                      className={`px-3 py-1 rounded border ${pagination.current_page * pagination.per_page >= pagination.total ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Detail Modal */}
        {showDetailModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Detail Catatan</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tanggal</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{new Date(selectedRecord.meeting_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tipe</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getMeetingTypeBadge(selectedRecord.meeting_type)}`}>
                      {selectedRecord.meeting_type}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Kelompok</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRecord.group?.name || '-'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Mentor</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRecord.mentor?.profile?.full_name || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tempat</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRecord.place}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Topik</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRecord.topic}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Catatan</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'} whitespace-pre-wrap`}>{selectedRecord.notes || 'Tidak ada catatan'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Buat catatan</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Kelompok</label>
                    <select
                      value={formData.group_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, group_id: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                      required
                    >
                      <option value="">Pilih Kelompok</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Mentor</label>
                    <select
                      value={formData.mentor_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, mentor_id: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                      required
                    >
                      <option value="">Pilih Mentor</option>
                      {mentors.map(mentor => (
                        <option key={mentor.id} value={mentor.id}>{mentor.profile?.full_name || mentor.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tanggal</label>
                    <input
                      type="date"
                      value={formData.meeting_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, meeting_date: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tipe</label>
                    <select
                      value={formData.meeting_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, meeting_type: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                      required
                    >
                      <option value="">Pilih Tipe</option>
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Assignment">Assignment</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tempat</label>
                  <input
                    type="text"
                    value={formData.place}
                    onChange={(e) => setFormData(prev => ({ ...prev, place: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Topik</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Catatan</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Edit Catatan</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Kelompok</label>
                    <select
                      value={formData.group_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, group_id: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                      required
                    >
                      <option value="">Pilih Kelompok</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Mentor</label>
                    <select
                      value={formData.mentor_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, mentor_id: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                      required
                    >
                      <option value="">Pilih Mentor</option>
                      {mentors.map(mentor => (
                        <option key={mentor.id} value={mentor.id}>{mentor.profile?.full_name || mentor.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tanggal</label>
                    <input
                      type="date"
                      value={formData.meeting_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, meeting_date: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tipe</label>
                    <select
                      value={formData.meeting_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, meeting_type: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                      required
                    >
                      <option value="">Pilih Tipe</option>
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Assignment">Assignment</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tempat</label>
                  <input
                    type="text"
                    value={formData.place}
                    onChange={(e) => setFormData(prev => ({ ...prev, place: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Topik</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Catatan</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md mx-4`}>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Hapus Catatan
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                  Apakah Anda yakin ingin menghapus catatan "{selectedRecord.topic}"? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CatatanPertemuan;
