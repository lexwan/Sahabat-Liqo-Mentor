import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Layout from '../../../components/admin/Layout';
import { useTheme } from '../../../contexts/ThemeContext';

const KelolaPengumuman = () => {
  const { isDark } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [archivedAnnouncements, setArchivedAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [currentView, setCurrentView] = useState('active'); // 'active' or 'archived'
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    event_date: '',
    file: null
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    type_filter: 'all',
    date_from: '',
    date_to: '',
    month: '',
    year: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const endpoint = currentView === 'archived' ? 'announcements/archived' : 'announcements';
      const response = await fetch(`${API_URL}/${endpoint}?${params}`);
      
      if (!response.ok) {
        toast.error('API pengumuman belum tersedia');
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        toast.error('Backend belum mengimplementasikan API pengumuman');
        return;
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        if (currentView === 'archived') {
          setArchivedAnnouncements(data.data || []);
        } else {
          setAnnouncements(data.data || []);
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } else {
        toast.error(data.message || 'Gagal memuat pengumuman');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Backend belum siap untuk API pengumuman');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics - now included in fetchAnnouncements
  const fetchStats = async () => {
    // Stats are now fetched together with announcements
    // This function kept for compatibility but does nothing
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [currentView, filters]);

  // Handle create
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (formData.event_date) formDataToSend.append('event_date', formData.event_date);
      if (formData.file) formDataToSend.append('file', formData.file);

      const response = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          toast.success(data.message || 'Pengumuman berhasil dibuat');
          setShowCreateModal(false);
          setFormData({ title: '', content: '', event_date: '', file: null });
          fetchAnnouncements();
        } else {
          toast.error(data.message || 'Gagal membuat pengumuman');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Gagal membuat pengumuman');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  // Handle edit
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('event_date', formData.event_date || '');
      if (formData.file) formDataToSend.append('file', formData.file);
      formDataToSend.append('_method', 'PUT');

      const response = await fetch(`${API_URL}/announcements/${selectedAnnouncement.id}`, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          toast.success(data.message || 'Pengumuman berhasil diupdate');
          setShowEditModal(false);
          fetchAnnouncements();
        } else {
          toast.error(data.message || 'Gagal mengupdate pengumuman');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Gagal mengupdate pengumuman');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/announcements/${selectedAnnouncement.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          toast.success(data.message || 'Pengumuman berhasil dihapus');
          setShowDeleteModal(false);
          fetchAnnouncements();
        } else {
          toast.error(data.message || 'Gagal menghapus pengumuman');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Gagal menghapus pengumuman');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/announcements/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        toast.success(data.message || `${selectedIds.length} pengumuman berhasil dihapus`);
        setShowBulkDeleteModal(false);
        setSelectedIds([]);
        fetchAnnouncements();
      } else {
        toast.error(data.message || 'Gagal menghapus pengumuman');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  // Handle archive/unarchive
  const handleArchive = async (id, action) => {
    try {
      const response = await fetch(`${API_URL}/announcements/${id}/${action}`, {
        method: 'POST'
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        toast.success(data.message || `Pengumuman berhasil ${action === 'archive' ? 'diarsipkan' : 'dikembalikan'}`);
        fetchAnnouncements();
      } else {
        toast.error(data.message || `Gagal ${action === 'archive' ? 'mengarsipkan' : 'mengembalikan'} pengumuman`);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    const currentData = currentView === 'archived' ? archivedAnnouncements : announcements;
    if (checked) {
      setSelectedIds(currentData.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle individual select
  const handleSelect = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const openEditModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      event_date: announcement.event_date || '',
      file: null
    });
    setShowEditModal(true);
  };



  const currentData = currentView === 'archived' ? archivedAnnouncements : announcements;
  const isAllSelected = currentData.length > 0 && selectedIds.length === currentData.length;

  return (
    <Layout activeMenu="Kelola Pengumuman">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Kelola Pengumuman
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Kelola pengumuman dan event
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentView(currentView === 'active' ? 'archived' : 'active')}
              className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
            >
              {currentView === 'active' ? 'Lihat Arsip' : 'Lihat Aktif'}
            </button>
            {currentView === 'active' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
              >
                + Tambah Pengumuman
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Aktif</h3>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total || 0}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Event</h3>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.event_announcements || 0}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Umum</h3>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.general_announcements || 0}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Terarsip</h3>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.archived || 0}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Event Mendatang</h3>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.upcoming_events || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Cari pengumuman..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
            />
            <select
              value={filters.type_filter}
              onChange={(e) => setFilters({...filters, type_filter: e.target.value})}
              className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
            >
              <option value="all">Semua Tipe</option>
              <option value="event">Event</option>
              <option value="general">Umum</option>
            </select>
            <input
              type="date"
              placeholder="Dari Tanggal"
              value={filters.date_from}
              onChange={(e) => setFilters({...filters, date_from: e.target.value})}
              className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
            />
            <input
              type="date"
              placeholder="Sampai Tanggal"
              value={filters.date_to}
              onChange={(e) => setFilters({...filters, date_to: e.target.value})}
              className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
            />
            <select
              value={filters.month}
              onChange={(e) => setFilters({...filters, month: e.target.value})}
              className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
            >
              <option value="">Pilih Bulan</option>
              {Array.from({length: 12}, (_, i) => (
                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('id-ID', {month: 'long'})}</option>
              ))}
            </select>
            <select
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
              className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
            >
              <option value="">Pilih Tahun</option>
              {Array.from({length: 5}, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-6`}>
            <div className="flex items-center justify-between">
              <span className={`${isDark ? 'text-white' : 'text-gray-800'}`}>
                {selectedIds.length} pengumuman dipilih
              </span>
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Hapus Terpilih
              </button>
            </div>
          </div>
        )}

        {/* Select All */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-4`}>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="mr-2"
            />
            <span className={`${isDark ? 'text-white' : 'text-gray-800'}`}>Pilih Semua</span>
          </label>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          </div>
        ) : currentData.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Tidak ada pengumuman {currentView === 'archived' ? 'terarsip' : 'aktif'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentData.map((announcement, index) => (
              <div key={announcement.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} relative`}>
                {/* Checkbox and Number */}
                <div className="flex justify-between items-start mb-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(announcement.id)}
                    onChange={(e) => handleSelect(announcement.id, e.target.checked)}
                    className="mt-1"
                  />
                  <span className={`text-sm font-medium px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    #{index + 1}
                  </span>
                </div>

                {/* Title */}
                <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {announcement.title}
                  {announcement.is_priority && (
                    <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded">Priority</span>
                  )}
                </h3>

                {/* Event Date */}
                {announcement.event_date && (
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    📅 {new Date(announcement.event_date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}

                {/* Content Preview */}
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'} line-clamp-3`}>
                  {announcement.content.length > 100 
                    ? announcement.content.substring(0, 100) + '...' 
                    : announcement.content}
                </p>

                {/* File Attachment */}
                {announcement.file_name && (
                  <div className={`text-xs mb-3 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    📎 {announcement.file_name} ({announcement.file_size})
                  </div>
                )}

                {/* Type and Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${announcement.is_event 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'}`}>
                    {announcement.is_event ? 'Event' : 'Umum'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    announcement.is_expired 
                      ? 'bg-red-100 text-red-800' 
                      : announcement.is_priority 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {announcement.is_expired ? 'Expired' : announcement.is_priority ? 'Priority' : 'Normal'}
                  </span>
                </div>

                {/* Created Date */}
                <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Dibuat: {new Date(announcement.created_at).toLocaleDateString('id-ID')}
                </p>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedAnnouncement(announcement);
                      setShowDetailModal(true);
                    }}
                    className="flex-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Detail
                  </button>
                  {currentView === 'active' ? (
                    <>
                      <button
                        onClick={() => openEditModal(announcement)}
                        className="flex-1 px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchive(announcement.id, 'archive')}
                        className="flex-1 px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        Arsip
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAnnouncement(announcement);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Hapus
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleArchive(announcement.id, 'unarchive')}
                      className="flex-1 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Kembalikan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Tambah Pengumuman
              </h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  type="text"
                  placeholder="Judul Pengumuman"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  required
                />
                <textarea
                  placeholder="Konten Pengumuman"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  rows="4"
                  required
                />
                <input
                  type="datetime-local"
                  placeholder="Tanggal Event (Opsional)"
                  value={formData.event_date}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <input
                  type="file"
                  onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                />
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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
                Edit Pengumuman
              </h3>
              <form onSubmit={handleEdit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Judul Pengumuman"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  required
                />
                <textarea
                  placeholder="Konten Pengumuman"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  rows="4"
                  required
                />
                <input
                  type="datetime-local"
                  placeholder="Tanggal Event (Opsional)"
                  value={formData.event_date}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                />
                <input
                  type="file"
                  onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar"
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
      {showDetailModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'} max-h-[80vh] overflow-y-auto`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Detail Pengumuman
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Judul</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedAnnouncement.title}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Konten</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'} whitespace-pre-wrap`}>{selectedAnnouncement.content}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Tipe</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedAnnouncement.is_event ? 'Event' : 'Umum'}</p>
                </div>
                {selectedAnnouncement.event_date && (
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Tanggal Event</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedAnnouncement.event_date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
                {selectedAnnouncement.file_name && (
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>File Attachment</label>
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                        📎 {selectedAnnouncement.file_name} ({selectedAnnouncement.file_size})
                      </p>
                      {selectedAnnouncement.file_path && (
                        <a
                          href={selectedAnnouncement.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                          Download File
                        </a>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Status</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedAnnouncement.is_expired ? 'Expired' : selectedAnnouncement.is_priority ? 'Priority' : 'Normal'}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Tanggal Dibuat</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(selectedAnnouncement.created_at).toLocaleDateString('id-ID')}
                  </p>
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
                Hapus Pengumuman
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin menghapus pengumuman <strong>{selectedAnnouncement?.title}</strong>?
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
                Hapus Pengumuman
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin menghapus <strong>{selectedIds.length}</strong> pengumuman yang dipilih?
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
    </Layout>
  );
};

export default KelolaPengumuman;