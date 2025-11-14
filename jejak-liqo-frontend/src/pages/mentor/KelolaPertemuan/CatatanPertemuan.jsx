import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../components/mentor/Layout';
import { FileText, Download, Calendar, Users, Eye, Plus, Trash2, Search, Filter, MapPin, Edit, CheckCircle, XCircle, AlertTriangle, AlertCircle, X, RotateCcw } from 'lucide-react';
import { getMentorMeetings, getMeetingDetail, deleteMeeting, getTrashedMeetings, restoreMeeting } from '../../../api/mentor';

const CatatanPertemuan = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    weeklyTotal: 0
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [meetingDetail, setMeetingDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [currentView, setCurrentView] = useState('active'); // 'active' or 'trashed'
  const [trashedReports, setTrashedReports] = useState([]);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (currentView === 'active') {
      fetchReports();
    } else {
      fetchTrashedReports();
    }
  }, [currentView]);

  const fetchReports = async () => {
    try {
      const data = await getMentorMeetings();
      setReports(data.data || []);
      setStats(data.stats || {
        weeklyTotal: 0
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashedReports = async () => {
    try {
      const data = await getTrashedMeetings();
      setTrashedReports(data.data || []);
    } catch (error) {
      console.error('Error fetching trashed reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!reportToDelete) return;
    
    try {
      await restoreMeeting(reportToDelete.id);
      
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = 'Pertemuan berhasil dipulihkan';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
      
      setShowRestoreModal(false);
      setReportToDelete(null);
      fetchTrashedReports();
    } catch (error) {
      console.error('Error restoring meeting:', error);
      
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = 'Gagal memulihkan pertemuan';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
    }
  };

  const currentReports = currentView === 'active' ? reports : trashedReports;
  const filteredReports = currentReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.group_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = currentView === 'trashed' || filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  // Reset to first page when view changes or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentView, searchQuery, filterType]);

  if (loading) {
    return (
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {currentView === 'active' ? 'Catatan Pertemuan' : 'Pertemuan Terhapus'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola catatan pertemuan kelompok
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={() => navigate(`/mentor/tambah-pertemuan/${groupId}`)}
              className="flex items-center justify-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white/90 dark:hover:bg-gray-800/90 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Tambah Pertemuan
            </button>
            <button 
              onClick={() => setCurrentView(currentView === 'active' ? 'trashed' : 'active')}
              className="flex items-center justify-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white/90 dark:hover:bg-gray-800/90 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg transition-colors"
            >
              <Trash2 size={16} className="mr-2" />
              {currentView === 'active' ? 'Terhapus' : 'Kembali'}
            </button>
          </div>
        </div>

        {/* Statistics Cards - Only show for active view */}
        {currentView === 'active' && (
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Total Pertemuan Minggu Ini</p>
                  <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">{stats.weeklyTotal}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={currentView === 'active' ? 'Cari pertemuan...' : 'Cari pertemuan terhapus...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {currentView === 'active' && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <option value="all">Semua Tipe</option>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="tugas">Tugas</option>
            </select>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentView === 'active' ? 'Daftar Pertemuan' : 'Daftar Pertemuan Terhapus'}
            </h2>
          </div>

          {filteredReports.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedReports.map((report) => (
                <div
                  key={report.id}
                  className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors ${
                    currentView === 'active' 
                      ? 'hover:bg-gray-50 dark:hover:bg-gray-700' 
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      report.type === 'offline' ? 'bg-green-100 dark:bg-green-900/30' :
                      report.type === 'online' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      <FileText size={20} className={`${
                        report.type === 'offline' ? 'text-green-600 dark:text-green-400' :
                        report.type === 'online' ? 'text-purple-600 dark:text-purple-400' :
                        'text-orange-600 dark:text-orange-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Meeting Title */}
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Materi:</p>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                          {report.title}
                        </h3>
                      </div>
                      
                      {/* Group Name */}
                      <div className="flex items-center mb-3">
                        <Users size={14} className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {report.group_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Meeting Details with Gap */}
                  <div className="space-y-2 mb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={14} className="mr-2 flex-shrink-0" />
                      <span className="font-medium">
                        {new Date(report.meeting_date || report.created_at).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin size={14} className="mr-2 flex-shrink-0" />
                      <span className="truncate font-medium">
                        {report.location || (report.type === 'online' ? 'Meeting Online' : 'Lokasi tidak ditentukan')}
                      </span>
                    </div>
                    {currentView === 'trashed' && (
                      <div className="flex items-center text-sm text-red-500 dark:text-red-400">
                        <Trash2 size={14} className="mr-2 flex-shrink-0" />
                        <span className="font-medium">
                          Dihapus: {new Date(report.deleted_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Attendance Cards - Only show for active view */}
                  {currentView === 'active' && (
                    <div className="mb-3">
                      <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2">Kehadiran</h4>
                      {report.attendance ? (
                        <div className="grid grid-cols-4 gap-1">
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                            <CheckCircle size={12} className="text-green-600 dark:text-green-400 mx-auto mb-1" />
                            <p className="text-xs text-green-600 dark:text-green-400">Hadir</p>
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400">{report.attendance.hadir || 0}</p>
                          </div>
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 text-center">
                            <AlertTriangle size={12} className="text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
                            <p className="text-xs text-yellow-600 dark:text-yellow-400">Sakit</p>
                            <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">{report.attendance.sakit || 0}</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                            <AlertCircle size={12} className="text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                            <p className="text-xs text-blue-600 dark:text-blue-400">Izin</p>
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{report.attendance.izin || 0}</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
                            <XCircle size={12} className="text-red-600 dark:text-red-400 mx-auto mb-1" />
                            <p className="text-xs text-red-600 dark:text-red-400">Alpha</p>
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400">{report.attendance.alpha || 0}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Belum ada data kehadiran</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Tambahkan kehadiran untuk melihat statistik</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  {currentView === 'active' ? (
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={async () => {
                          setSelectedReport(report);
                          setShowDetailModal(true);
                          setLoadingDetail(true);
                          try {
                            const detail = await getMeetingDetail(report.id);
                            setMeetingDetail(detail.data);
                          } catch (error) {
                            console.error('Error fetching meeting detail:', error);
                          } finally {
                            setLoadingDetail(false);
                          }
                        }}
                        className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => navigate(`/mentor/edit-pertemuan/${report.id}`)}
                        className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          setReportToDelete(report);
                          setShowDeleteModal(true);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <button 
                        onClick={() => {
                          setReportToDelete(report);
                          setShowRestoreModal(true);
                        }}
                        className="flex items-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md"
                      >
                        <RotateCcw size={16} className="mr-2" />
                        Pulihkan Pertemuan
                      </button>
                    </div>
                  )}
                </div>
              ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} dari {filteredReports.length} pertemuan
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Sebelumnya
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {currentView === 'active' ? 'Belum Ada Pertemuan' : 'Tidak Ada Pertemuan Terhapus'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {currentView === 'active' 
                  ? 'Catatan pertemuan akan muncul di sini setelah Anda membuat pertemuan.'
                  : 'Pertemuan yang dihapus akan muncul di sini.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedReport && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedReport.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Detail catatan pertemuan</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    selectedReport.type === 'offline' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    selectedReport.type === 'online' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {selectedReport.type || 'offline'}
                  </span>
                  <button 
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Photo Preview */}
                {!loadingDetail && meetingDetail && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Eye size={20} className="mr-2 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Foto Pertemuan</h3>
                    </div>
                    {meetingDetail.photos && meetingDetail.photos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {meetingDetail.photos.map((photo, index) => (
                          <div key={index} className="relative group cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                            <img
                              src={photo}
                              alt={`Foto pertemuan ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Eye size={20} className="text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">Tidak ada foto untuk pertemuan ini</p>
                    )}
                  </div>
                )}
                
                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Group Info Card */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Users size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Informasi Kelompok</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Users size={16} className="mr-2 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">{selectedReport.group_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">
                          Dibuat: {meetingDetail ? new Date(meetingDetail.group_created_at).toLocaleDateString('id-ID') : new Date(selectedReport.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users size={16} className="mr-2 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">
                          {meetingDetail ? meetingDetail.mentees.length : (selectedReport.attendance?.hadir || 0) + (selectedReport.attendance?.sakit || 0) + (selectedReport.attendance?.izin || 0) + (selectedReport.attendance?.alpha || 0)} Mentee
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Meeting Details Card */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <FileText size={20} className="mr-2 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Detail Pertemuan</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">
                          {new Date(selectedReport.meeting_date || selectedReport.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">{selectedReport.location || 'Online'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <CheckCircle size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ringkasan Kehadiran</h3>
                  </div>
                  {selectedReport.attendance ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Hadir</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{selectedReport.attendance.hadir || 0}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                          <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sakit</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{selectedReport.attendance.sakit || 0}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                          <AlertCircle size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Izin</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{selectedReport.attendance.izin || 0}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                          <XCircle size={16} className="text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Alpha</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{selectedReport.attendance.alpha || 0}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Belum ada data kehadiran</p>
                  )}
                </div>

                {/* Mentee List */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Daftar Mentee</h3>
                  {loadingDetail ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Memuat data mentee...</p>
                  ) : meetingDetail && meetingDetail.mentees && meetingDetail.mentees.length > 0 ? (
                    <div className="space-y-2">
                      {meetingDetail.mentees.map((mentee) => (
                        <div key={mentee.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              mentee.status === 'hadir' ? 'bg-green-100 dark:bg-green-900/30' :
                              mentee.status === 'sakit' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                              mentee.status === 'izin' ? 'bg-blue-100 dark:bg-blue-900/30' :
                              mentee.status === 'alpha' ? 'bg-red-100 dark:bg-red-900/30' :
                              'bg-gray-100 dark:bg-gray-900/30'
                            }`}>
                              {mentee.status === 'hadir' ? (
                                <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                              ) : mentee.status === 'sakit' ? (
                                <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400" />
                              ) : mentee.status === 'izin' ? (
                                <AlertCircle size={16} className="text-blue-600 dark:text-blue-400" />
                              ) : mentee.status === 'alpha' ? (
                                <XCircle size={16} className="text-red-600 dark:text-red-400" />
                              ) : (
                                <Users size={16} className="text-gray-500" />
                              )}
                            </div>
                            <span className="text-gray-900 dark:text-white font-medium">{mentee.full_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              mentee.status === 'hadir' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              mentee.status === 'sakit' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              mentee.status === 'izin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              mentee.status === 'alpha' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {mentee.status === 'tidak hadir' ? 'Tidak ada data' : mentee.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Belum ada data mentee untuk pertemuan ini</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && reportToDelete && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Konfirmasi Hapus
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Apakah Anda yakin ingin menghapus pertemuan "{reportToDelete.title}"? Data ini dapat dipulihkan dari halaman terhapus.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setReportToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    try {
                      await deleteMeeting(reportToDelete.id);
                      
                      const toast = document.createElement('div');
                      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                      toast.textContent = 'Pertemuan berhasil dihapus';
                      document.body.appendChild(toast);
                      setTimeout(() => document.body.removeChild(toast), 2000);
                      
                      setShowDeleteModal(false);
                      setReportToDelete(null);
                      fetchReports();
                    } catch (error) {
                      console.error('Error deleting meeting:', error);
                      
                      const toast = document.createElement('div');
                      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                      toast.textContent = 'Gagal menghapus pertemuan';
                      document.body.appendChild(toast);
                      setTimeout(() => document.body.removeChild(toast), 2000);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restore Confirmation Modal */}
        {showRestoreModal && reportToDelete && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Konfirmasi Pulihkan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Apakah Anda yakin ingin memulihkan pertemuan "{reportToDelete.title}"?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRestoreModal(false);
                    setReportToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleRestore}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Pulihkan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Photo Popup Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4" onClick={() => setSelectedPhoto(null)}>
            <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedPhoto}
                alt="Foto pertemuan"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-4 -right-4 bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CatatanPertemuan;