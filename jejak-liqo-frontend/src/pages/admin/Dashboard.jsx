import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Layout from '../../components/admin/Layout';
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const { isDark } = useTheme();

  return (
    <Layout activeMenu="Dashboard">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className={`rounded-2xl p-8 text-center transition-colors duration-300 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-sm`}>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                Selamat Datang di Dashboard Admin
              </h1>
              <p className={`transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Kelola mentee, mentor, laporan, dan pengumuman dari sini
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`rounded-2xl p-6 transition-colors duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-sm`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <TrendingUp className={`w-5 h-5 ${
                    isDark ? 'text-green-400' : 'text-green-500'
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold mb-1 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Total Mentee
                </h3>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">150</p>
              </div>

              <div className={`rounded-2xl p-6 transition-colors duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-sm`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <TrendingUp className={`w-5 h-5 ${
                    isDark ? 'text-green-400' : 'text-green-500'
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold mb-1 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Total Mentor
                </h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">25</p>
              </div>

              <div className={`rounded-2xl p-6 transition-colors duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-sm`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <TrendingUp className={`w-5 h-5 ${
                    isDark ? 'text-green-400' : 'text-green-500'
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold mb-1 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Laporan Pending
                </h3>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">8</p>
              </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;