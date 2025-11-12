import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  Trash2,
  RotateCcw,
  Search,
  AlertTriangle,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import Sidebar from '../../../components/superadmin/Sidebar';
import Header from '../../../components/superadmin/Header';

const RecycleBin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [deletedAdmins, setDeletedAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { isDark } = useTheme();

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // Fetch soft deleted admins
  const fetchDeletedAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admins/trashed');
      
      if (response.data.status === 'success') {
        setDeletedAdmins(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch deleted admins:', error);
      toast.error('Gagal memuat data admin yang dihapus');
    } finally {
      setLoading(false);
    }
  };

  // Restore admin
  const handleRestore = async (adminId) => {
    try {
      await api.post(`/admins/${adminId}/restore`);
      toast.success('Admin berhasil dipulihkan');
      fetchDeletedAdmins();
    } catch (error) {
      console.error('Failed to restore admin:', error);
      toast.error('Gagal memulihkan admin');
    }
  };

  // Permanent delete
  const handlePermanentDelete = async (adminId) => {
    if (!confirm('Yakin ingin menghapus permanen? Tindakan ini tidak dapat dibatalkan!')) {
      return;
    }
    
    try {
      await api.delete(`/admins/${adminId}/force`);
      toast.success('Admin berhasil dihapus permanen');
      fetchDeletedAdmins();
    } catch (error) {
      console.error('Failed to permanently delete admin:', error);
      toast.error('Gagal menghapus admin secara permanen');
    }
  };

  useEffect(() => {
    fetchDeletedAdmins();
  }, []);

  const filteredAdmins = deletedAdmins.filter(admin =>
    admin.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-[#4DABFF]/10 via-white to-[#4DABFF]/5'
    }`}>
      <Sidebar isOpen={sidebarOpen} isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} activeMenu="Recycle Bin" />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-72'}`}>
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-2">
              <Link to="/superadmin/kelola-admin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow-lg'
                  } shadow-md`}
                >
                  <ArrowLeft size={20} />
                </motion.button>
              </Link>
              <div>
                <h1 className={`text-3xl font-bold flex items-center ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  <Trash2 size={32} className="mr-3 text-red-500" />
                  Recycle Bin
                </h1>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  Admin yang dihapus dapat dipulihkan atau dihapus permanen
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className={`rounded-2xl shadow-md p-6 mb-6 border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="relative max-w-md">
              <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Cari admin yang dihapus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className={`rounded-2xl shadow-md p-8 text-center border ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Memuat data...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className={`rounded-2xl shadow-md p-12 text-center border ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <Trash2 size={48} className={`mx-auto mb-4 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Recycle Bin Kosong</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                Tidak ada admin yang dihapus
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAdmins.map((admin, index) => (
                <motion.div
                  key={admin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-2xl shadow-md border p-6 ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {admin.profile?.full_name?.split(' ').map(n => n[0]).join('') || admin.email[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {admin.profile?.full_name || 'Nama tidak tersedia'}
                        </h3>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>{admin.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`text-xs flex items-center ${
                            isDark ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            <Calendar size={12} className="mr-1" />
                            Dihapus: {new Date(admin.deleted_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRestore(admin.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                      >
                        <RotateCcw size={16} />
                        <span>Pulihkan</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePermanentDelete(admin.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                      >
                        <AlertTriangle size={16} />
                        <span>Hapus Permanen</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecycleBin;