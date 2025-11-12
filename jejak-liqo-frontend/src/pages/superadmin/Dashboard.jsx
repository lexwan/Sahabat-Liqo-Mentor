import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  TrendingUp,
  FileText,
  UsersRound,
  GraduationCap,
  Users,
  Megaphone
} from 'lucide-react';
import Sidebar from '../../components/superadmin/Sidebar';
import Header from '../../components/superadmin/Header';
import LogoutConfirmModal from '../../components/ui/LogoutConfirmModal';
import { logout } from '../../api/auth';

// Get trend status from change value
const getTrendStatus = (change) => {
  if (!change || change === '0') return 'neutral';
  if (change.startsWith('+')) return 'up';
  if (change.startsWith('-')) return 'down';
  return 'neutral';
};

// Stats configuration using backend comparison data
const getStatsConfig = (data) => [
  { 
    id: 1, 
    title: 'Total Mentee', 
    value: data?.totals?.totalMentee || '0', 
    icon: GraduationCap, 
    color: 'from-emerald-500 to-teal-400', 
    change: `+${data?.additions?.totalMentee || '0'}`,
    trendStatus: 'up'
  },
  { 
    id: 2, 
    title: 'Total Laporan', 
    value: data?.totals?.totalLaporan || '0', 
    icon: FileText, 
    color: 'from-purple-500 to-pink-400', 
    change: `+${data?.additions?.totalLaporan || '0'}`,
    trendStatus: 'up',
    subtitle: '(Minggu Ini)' 
  },
  { 
    id: 3, 
    title: 'Total Admin', 
    value: data?.totals?.totalAdmin || '0', 
    icon: Users, 
    color: 'from-green-500 to-emerald-400', 
    change: `+${data?.additions?.totalAdmin || '0'}`,
    trendStatus: 'up'
  },
  { 
    id: 4, 
    title: 'Total Mentor', 
    value: data?.totals?.totalMentor || '0', 
    icon: UsersRound, 
    color: 'from-orange-500 to-amber-400', 
    change: `+${data?.additions?.totalMentor || '0'}`,
    trendStatus: 'up'
  }
];

const announcements = [
  { id: 1, title: 'Pembaruan Sistem Dashboard', date: '15 Oktober 2025' },
  { id: 2, title: 'Meeting Evaluasi Bulanan', date: '12 Oktober 2025' },
  { id: 3, title: 'Pelatihan Admin Baru', date: '10 Oktober 2025' },
  { id: 4, title: 'Update Kebijakan Privasi', date: '8 Oktober 2025' }
];





// Stats Card Component
const StatsCard = ({ stat, index }) => {
  const Icon = stat.icon;
  const { isDark } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration : 0 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`rounded-2xl shadow-md hover:shadow-xl transition-all p-6 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</p>
          {stat.subtitle && (
            <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.subtitle}</p>
          )}
          <h3 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{stat.value}</h3>
          <span className={`inline-flex items-center text-sm font-semibold ${
            stat.trendStatus === 'up' 
              ? 'text-green-600' 
              : stat.trendStatus === 'down'
              ? 'text-red-600'
              : 'text-gray-600'
          }`}>
            <TrendingUp 
              size={16} 
              className={`mr-1 ${
                stat.trendStatus === 'up' ? 'rotate-0' 
                : stat.trendStatus === 'down' ? 'rotate-180'
                : 'rotate-90'
              }`} 
            />
            {stat.change}
          </span>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
          <Icon size={28} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// Welcome Card Component
const WelcomeCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white mb-6"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-2">
        Selamat datang kembali, Super Admin! 👋
      </h2>
      <p className="text-emerald-100 text-lg">Semoga harimu produktif 💪</p>
    </motion.div>
  );
};

// Announcements Card Component
const AnnouncementsCard = () => {
  const { isDark } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className={`rounded-2xl shadow-md p-6 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
      }`}
    >
      <h3 className={`text-xl font-bold mb-4 flex items-center ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>
        <Megaphone size={24} className="mr-2 text-emerald-500" />
        Pengumuman Terbaru
      </h3>
      <div className="space-y-3">
        {announcements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            whileHover={{ x: 5 }}
            className={`p-4 rounded-xl transition-all cursor-pointer ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <h4 className={`font-semibold mb-1 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {announcement.title}
            </h4>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>{announcement.date}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Recent Admins Table Component
const RecentAdminsTable = ({ recentAdmins, loading }) => {
  const { isDark } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className={`rounded-2xl shadow-md p-6 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
      }`}
    >
      <h3 className={`text-xl font-bold mb-4 flex items-center ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>
        <Users size={24} className="mr-2 text-emerald-500" />
        Admin Terbaru
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${
              isDark ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <th className={`text-left py-3 px-2 text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Nama</th>
              <th className={`text-left py-3 px-2 text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Email</th>
              <th className={`text-left py-3 px-2 text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Bergabung</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className={`border-b last:border-0 ${
                  isDark ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full animate-pulse ${
                        isDark ? 'bg-gray-600' : 'bg-gray-200'
                      }`}></div>
                      <div className={`h-4 w-24 rounded animate-pulse ${
                        isDark ? 'bg-gray-600' : 'bg-gray-200'
                      }`}></div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className={`h-4 w-32 rounded animate-pulse ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                  </td>
                  <td className="py-4 px-2">
                    <div className={`h-4 w-20 rounded animate-pulse ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                  </td>
                </tr>
              ))
            ) : recentAdmins.length > 0 ? (
              recentAdmins.map((admin, index) => (
                <motion.tr
                  key={admin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                  className={`border-b last:border-0 ${
                    isDark ? 'border-gray-700' : 'border-gray-100'
                  }`}
                >
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      {admin.profile_picture ? (
                        <img 
                          src={admin.profile_picture} 
                          alt={admin.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {admin.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <span className={`font-medium ${
                        isDark ? 'text-white' : 'text-gray-800'
                      }`}>{admin.name}</span>
                    </div>
                  </td>
                  <td className={`py-4 px-2 text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>{admin.email}</td>
                  <td className={`py-4 px-2 text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>{admin.joinDate}</td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className={`py-8 text-center ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Belum ada admin terbaru
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [statsData, setStatsData] = useState([]);
  const [recentAdmins, setRecentAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isDark } = useTheme();
  const navigate = useNavigate();



  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout berhasil.');
      navigate('/login');
    } catch (error) {
      toast.error('Gagal logout, coba lagi.');
    }
    setShowLogoutModal(false);
  };

  // Fetch dashboard statistics with comparison
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats-comparison');
        const data = response.data.data;
        
        setStatsData(getStatsConfig(data));
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        toast.error('Gagal memuat statistik dashboard');
        // Use default values on error
        setStatsData(getStatsConfig({}));
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentAdmins = async () => {
      try {
        const response = await api.get('/admins?per_page=5&sort=created_at&order=desc');
        if (response.data.status === 'success') {
          const admins = response.data.data.data.map(admin => ({
            id: admin.id,
            name: admin.profile?.full_name || admin.email,
            email: admin.email,
            profile_picture: admin.profile?.profile_picture ? `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/storage/${admin.profile.profile_picture}` : null,
            joinDate: new Date(admin.created_at).toLocaleDateString('id-ID')
          }));
          setRecentAdmins(admins);
        }
      } catch (error) {
        console.error('Failed to fetch recent admins:', error);
        toast.error('Gagal memuat data admin terbaru');
      } finally {
        setLoadingAdmins(false);
      }
    };

    fetchStats();
    fetchRecentAdmins();
  }, []);

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5'
    }`}>
      <Sidebar isOpen={sidebarOpen} isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} activeMenu="Dashboard" />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-72'}`}>
        <Header toggleSidebar={toggleSidebar} onLogoutClick={() => setShowLogoutModal(true)} />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <WelcomeCard />
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={`rounded-2xl shadow-md p-6 animate-pulse ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className={`h-4 rounded mb-2 w-24 ${
                        isDark ? 'bg-gray-600' : 'bg-gray-200'
                      }`}></div>
                      <div className={`h-8 rounded mb-2 w-16 ${
                        isDark ? 'bg-gray-600' : 'bg-gray-200'
                      }`}></div>
                      <div className={`h-4 rounded w-12 ${
                        isDark ? 'bg-gray-600' : 'bg-gray-200'
                      }`}></div>
                    </div>
                    <div className={`w-14 h-14 rounded-xl ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                  </div>
                </div>
              ))
            ) : (
              statsData.map((stat, index) => (
                <StatsCard key={stat.id} stat={stat} index={index} />
              ))
            )}
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnnouncementsCard />
            <RecentAdminsTable recentAdmins={recentAdmins} loading={loadingAdmins} />
          </div>
        </main>
      </div>
      
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Dashboard;