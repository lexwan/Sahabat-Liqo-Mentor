import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import Layout from '../../../components/admin/Layout';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText,
  Info,
  Calendar,
  MapPin,
  Users,
  Monitor,
  Wifi,
  WifiOff,
  BookOpen,
  Download,
  Filter,
  BarChart3,
  TrendingUp,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { meetingAPI, downloadFile } from '../../../utils/api';

const KelolaLaporan = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
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
    group_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    meeting_types: {
      online: 0,
      offline: 0,
      assignment: 0
    },
    activeMentors: 0,
    activeGroups: 0
  });
  const [chartData, setChartData] = useState({
    pieData: [],
    lineData: [],
    barData: []
  });

  useEffect(() => {
    fetchReports();
    fetchGroups();
    // fetchMentors(); // Now handled in fetchGroups
    fetchStats();
  }, [pagination.current_page, filters]);

  useEffect(() => {
    generateChartData();
  }, [reports]);

  const fetchReports = async () => {
    try {
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(filters.meeting_type && { meeting_type: filters.meeting_type }),
        ...(filters.mentor_id && { mentor_id: filters.mentor_id }),
        ...(filters.group_id && { group_id: filters.group_id }),
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await meetingAPI.getList(params);
      const data = response.data;
      
      if (data.status === 'success') {
        setReports(data.data || []);
        setStats(data.stats || stats);
        setPagination(prev => ({
          ...prev,
          current_page: data.meta?.current_page || 1,
          total: data.meta?.total || 0,
          last_page: data.meta?.last_page || 1
        }));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await meetingAPI.getStats();
      if (response.data.status === 'success') {
        setStats(response.data.data || stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateChartData = () => {
    // Use stats data if available, otherwise calculate from reports
    if (stats.meeting_types) {
      const pieData = [
        { name: 'Online', value: stats.meeting_types.online || 0, color: '#3B82F6' },
        { name: 'Offline', value: stats.meeting_types.offline || 0, color: '#10B981' },
        { name: 'Assignment', value: stats.meeting_types.assignment || 0, color: '#8B5CF6' }
      ].filter(item => item.value > 0);
      
      setChartData(prev => ({ ...prev, pieData }));
    } else {
      // Fallback to calculating from reports
      const typeCount = reports.reduce((acc, report) => {
        acc[report.meeting_type] = (acc[report.meeting_type] || 0) + 1;
        return acc;
      }, {});
      
      const pieData = Object.entries(typeCount).map(([type, count]) => ({
        name: type,
        value: count,
        color: type === 'Online' ? '#3B82F6' : type === 'Offline' ? '#10B981' : '#8B5CF6'
      }));
      
      setChartData(prev => ({ ...prev, pieData }));
    }

    // Line chart data for monthly trends
    const monthlyData = reports.reduce((acc, report) => {
      const month = new Date(report.meeting_date).toLocaleDateString('id-ID', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    
    const lineData = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      meetings: count
    }));

    // Bar chart data for top mentors
    const mentorCount = reports.reduce((acc, report) => {
      const mentorName = report.mentor?.name || 'Unknown';
      acc[mentorName] = (acc[mentorName] || 0) + 1;
      return acc;
    }, {});
    
    const barData = Object.entries(mentorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([mentor, count]) => ({
        mentor: mentor.length > 15 ? mentor.substring(0, 15) + '...' : mentor,
        meetings: count
      }));

    setChartData(prev => ({ ...prev, lineData, barData }));
  };

  const exportPDF = async () => {
    try {
      const params = {
        start_date: `${filters.year}-${String(filters.month).padStart(2, '0')}-01`,
        end_date: `${filters.year}-${String(filters.month).padStart(2, '0')}-31`,
        ...(filters.group_id && { group_id: filters.group_id }),
        ...(filters.meeting_type && { meeting_type: filters.meeting_type })
      };
      const response = await meetingAPI.exportPDF(params);
      const monthName = new Date(0, filters.month - 1).toLocaleDateString('id-ID', { month: 'long' });
      downloadFile(response.data, `laporan_kehadiran_mentee_${monthName}_${filters.year}.pdf`);
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Gagal mengunduh PDF');
    }
  };

  const exportExcel = async () => {
    try {
      const params = {
        start_date: `${filters.year}-01-01`,
        end_date: `${filters.year}-12-31`,
        ...(filters.group_id && { group_id: filters.group_id }),
        ...(filters.meeting_type && { meeting_type: filters.meeting_type })
      };
      const response = await meetingAPI.exportExcel(params);
      downloadFile(response.data, `laporan_kehadiran_mentee_${filters.year}.xlsx`);
      toast.success('Excel berhasil diunduh');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Gagal mengunduh Excel');
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await meetingAPI.getFormOptions();
      if (response.data.status === 'success') {
        setGroups(response.data.data.groups || []);
        setMentors(response.data.data.mentors || []);
      }
    } catch (error) {
      console.error('Error fetching form options:', error);
    }
  };

  const fetchMentors = async () => {
    // This is now handled in fetchGroups via getFormOptions
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await meetingAPI.create(formData);
      if (response.data.status === 'success') {
        toast.success('Laporan berhasil ditambahkan');
        setShowAddModal(false);
        setFormData({ group_id: '', mentor_id: '', meeting_date: '', place: '', topic: '', notes: '', meeting_type: '' });
        fetchReports();
      }
    } catch (error) {
      console.error('Error adding report:', error);
      toast.error(error.response?.data?.message || 'Gagal menambahkan laporan');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await meetingAPI.update(selectedReport.id, formData);
      if (response.data.status === 'success') {
        toast.success('Laporan berhasil diperbarui');
        setShowEditModal(false);
        setSelectedReport(null);
        fetchReports();
      }
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui laporan');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await meetingAPI.delete(selectedReport.id);
      if (response.data.status === 'success') {
        toast.success('Laporan berhasil dihapus');
        setShowDeleteModal(false);
        setSelectedReport(null);
        fetchReports();
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus laporan');
    }
  };

  const filteredReports = reports.filter(report =>
    report.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.mentor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.group?.group_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (report) => {
    setSelectedReport(report);
    setFormData({
      group_id: report.group?.id || '',
      mentor_id: report.mentor?.id || '',
      meeting_date: report.meeting_date || '',
      place: report.place || '',
      topic: report.topic || '',
      notes: report.notes || '',
      meeting_type: report.meeting_type || ''
    });
    setShowEditModal(true);
  };

  const openDetailModal = async (report) => {
    try {
      const response = await meetingAPI.getDetail(report.id);
      if (response.data.status === 'success') {
        setSelectedReport(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching meeting detail:', error);
      toast.error('Gagal memuat detail meeting');
    }
  };

  const openDeleteModal = (report) => {
    setSelectedReport(report);
    setShowDeleteModal(true);
  };



  const getMeetingTypeIcon = (type) => {
    switch (type) {
      case 'Online':
        return <Wifi size={16} className="text-blue-500" />;
      case 'Offline':
        return <WifiOff size={16} className="text-green-500" />;
      case 'Assignment':
        return <BookOpen size={16} className="text-purple-500" />;
      default:
        return <Monitor size={16} className="text-gray-500" />;
    }
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
    <Layout activeMenu="Kelola Laporan">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
              Kelola Laporan Pertemuan
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Dashboard analitik dan manajemen laporan pertemuan
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportPDF}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
            >
              <Download size={20} />
              <span>Export Kehadiran (PDF)</span>
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <Download size={20} />
              <span>Export Kehadiran (Excel)</span>
            </button>
            <button
              onClick={() => navigate('/admin/laporan-bulanan')}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              <Plus size={20} />
              <span>Buat Laporan</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Pertemuan</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Minggu Ini</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.thisWeek}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Tren Bulanan</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData.lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="meetings" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Top Mentor</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData.barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mentor" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="meetings" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className={isDark ? 'text-white' : 'text-gray-800'} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Filter & Pencarian</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
              <input
                type="text"
                placeholder="Cari laporan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              />
            </div>
            
            <select
              value={filters.meeting_type}
              onChange={(e) => setFilters(prev => ({ ...prev, meeting_type: e.target.value }))}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
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
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            >
              <option value="">Semua Kelompok</option>
              <option value="ikhwan">Kelompok Ikhwan</option>
              <option value="akhwat">Kelompok Akhwat</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.group_name}
                </option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <select
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleDateString('id-ID', { month: 'short' })}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}
        >
          <div className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Daftar Laporan Pertemuan</h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tanggal</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Kelompok</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Mentor</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Topik Pembahasan</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tipe</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((report, index) => (
                        <tr key={report.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {new Date(report.meeting_date).toLocaleDateString('id-ID')}
                          </td>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {report.group?.group_name || '-'}
                          </td>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {report.mentor?.name || '-'}
                          </td>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {report.topic}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getMeetingTypeBadge(report.meeting_type)}`}>
                              {getMeetingTypeIcon(report.meeting_type)}
                              {report.meeting_type}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openDetailModal(report)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Lihat Detail"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => openEditModal(report)}
                                className="p-1 text-yellow-600 hover:bg-yellow-100 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(report)}
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

        {/* Modals */}
        {showDetailModal && selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Detail Laporan</h3>
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
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{new Date(selectedReport.meeting_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tipe</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getMeetingTypeBadge(selectedReport.meeting_type)}`}>
                      {getMeetingTypeIcon(selectedReport.meeting_type)}
                      {selectedReport.meeting_type}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Kelompok</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedReport.group?.group_name || '-'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Mentor</label>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedReport.mentor?.name || '-'}</p>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tempat</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedReport.place}</p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Topik</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedReport.topic}</p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Catatan</label>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'} whitespace-pre-wrap`}>{selectedReport.notes || 'Tidak ada catatan'}</p>
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
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Tambah Laporan</h3>
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
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
                      required
                    >
                      <option value="">Pilih Kelompok</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.group_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Mentor</label>
                    <select
                      value={formData.mentor_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, mentor_id: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
                      required
                    >
                      <option value="">Pilih Mentor</option>
                      {mentors.map(mentor => (
                        <option key={mentor.id} value={mentor.id}>{mentor.name || mentor.email}</option>
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
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tipe</label>
                    <select
                      value={formData.meeting_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, meeting_type: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
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
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Topik</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Catatan</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Edit Laporan</h3>
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
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
                      required
                    >
                      <option value="">Pilih Kelompok</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.group_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Mentor</label>
                    <select
                      value={formData.mentor_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, mentor_id: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
                      required
                    >
                      <option value="">Pilih Mentor</option>
                      {mentors.map(mentor => (
                        <option key={mentor.id} value={mentor.id}>{mentor.name || mentor.email}</option>
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
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Tipe</label>
                    <select
                      value={formData.meeting_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, meeting_type: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
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
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Topik</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Catatan</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500`}
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md mx-4`}>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Hapus Laporan
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                  Apakah Anda yakin ingin menghapus laporan "{selectedReport.topic}"? Tindakan ini tidak dapat dibatalkan.
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

export default KelolaLaporan;