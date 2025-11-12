import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import Layout from '../../../components/admin/Layout';
import { 
  Search, 
  Download,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { meetingAPI, downloadFile } from '../../../utils/api';

const LaporanKehadiran = () => {
  const { isDark } = useTheme();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [filters, setFilters] = useState({
    mentor_id: '',
    group_id: '',
    meeting_type: '',
    status: '',
    start_date: '',
    end_date: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0
  });
  const [stats, setStats] = useState({
    total_attendance: 0,
    present: 0,
    sick: 0,
    permission: 0,
    absent: 0
  });

  useEffect(() => {
    fetchAttendanceReport();
    fetchFormOptions();
  }, [pagination.current_page, filters]);

  const fetchAttendanceReport = async () => {
    try {
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.mentor_id && { mentor_id: filters.mentor_id }),
        ...(filters.group_id && { group_id: filters.group_id }),
        ...(filters.meeting_type && { meeting_type: filters.meeting_type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date })
      };
      
      const response = await meetingAPI.getAttendanceReport(params);
      const data = response.data;
      
      if (data.status === 'success') {
        setAttendanceData(data.data || []);
        setStats(data.stats || stats);
        setPagination(prev => ({
          ...prev,
          current_page: data.meta?.current_page || 1,
          total: data.meta?.total || 0,
          last_page: data.meta?.last_page || 1
        }));
      }
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      toast.error('Gagal memuat laporan kehadiran');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormOptions = async () => {
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

  const exportPDF = async () => {
    try {
      const params = {
        ...(filters.mentor_id && { mentor_id: filters.mentor_id }),
        ...(filters.group_id && { group_id: filters.group_id }),
        ...(filters.meeting_type && { meeting_type: filters.meeting_type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date })
      };
      const response = await meetingAPI.exportPDF(params);
      const period = filters.start_date && filters.end_date 
        ? `${filters.start_date}_${filters.end_date}`
        : new Date().toISOString().slice(0, 7);
      downloadFile(response.data, `laporan_kehadiran_mentee_${period}.pdf`);
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Gagal mengunduh PDF');
    }
  };

  const exportExcel = async () => {
    try {
      const params = {
        ...(filters.mentor_id && { mentor_id: filters.mentor_id }),
        ...(filters.group_id && { group_id: filters.group_id }),
        ...(filters.meeting_type && { meeting_type: filters.meeting_type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date })
      };
      const response = await meetingAPI.exportExcel(params);
      const period = filters.start_date && filters.end_date 
        ? `${filters.start_date}_${filters.end_date}`
        : new Date().toISOString().slice(0, 7);
      downloadFile(response.data, `laporan_kehadiran_mentee_${period}.xlsx`);
      toast.success('Excel berhasil diunduh');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Gagal mengunduh Excel');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'Sick':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'Permission':
        return <Clock size={16} className="text-blue-500" />;
      case 'Absent':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Users size={16} className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Present': 'bg-green-100 text-green-800 border-green-200',
      'Sick': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Permission': 'bg-blue-100 text-blue-800 border-blue-200',
      'Absent': 'bg-red-100 text-red-800 border-red-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredData = attendanceData.filter(item =>
    item.mentee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.meeting?.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout activeMenu="Laporan Kehadiran">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Laporan Kehadiran Mentee
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Laporan kehadiran mentee dalam pertemuan
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportPDF}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
            >
              <Download size={20} />
              <span>Export PDF</span>
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              <Download size={20} />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.total_attendance}</p>
              </div>
              <Users className="text-gray-500" size={20} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Hadir</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.present}</p>
              </div>
              <CheckCircle className="text-green-500" size={20} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sakit</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.sick}</p>
              </div>
              <AlertCircle className="text-yellow-500" size={20} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Izin</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.permission}</p>
              </div>
              <Clock className="text-blue-500" size={20} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Alpa</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.absent}</p>
              </div>
              <XCircle className="text-red-500" size={20} />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className={isDark ? 'text-white' : 'text-gray-800'} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Filter & Pencarian</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
              <input
                type="text"
                placeholder="Cari mentee atau topik..."
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
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            >
              <option value="">Semua Status</option>
              <option value="Present">Hadir</option>
              <option value="Sick">Sakit</option>
              <option value="Permission">Izin</option>
              <option value="Absent">Alpa</option>
            </select>
            
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
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.group_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.mentor_id}
              onChange={(e) => setFilters(prev => ({ ...prev, mentor_id: e.target.value }))}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            >
              <option value="">Semua Mentor</option>
              {mentors.map(mentor => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.name || mentor.email}
                </option>
              ))}
            </select>
            
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              placeholder="Tanggal Mulai"
            />
            
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              placeholder="Tanggal Akhir"
            />
          </div>
        </div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}
        >
          <div className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Laporan Kehadiran Mentee</h3>
            
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
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Mentor</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Mentee</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Kelas</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Bulan</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Topik</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tipe</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => (
                        <tr key={item.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {((pagination.current_page - 1) * pagination.per_page) + index + 1}
                          </td>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.meeting?.mentor?.email || '-'}
                          </td>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.mentee?.full_name || '-'}
                          </td>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.mentee?.activity_class || '-'}
                          </td>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {new Date(item.meeting?.meeting_date).toLocaleDateString('id-ID', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </td>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.meeting?.topic || '-'}
                          </td>
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.meeting?.meeting_type || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(item.status)}`}>
                              {getStatusIcon(item.status)}
                              {item.status}
                            </span>
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
      </div>
    </Layout>
  );
};

export default LaporanKehadiran;