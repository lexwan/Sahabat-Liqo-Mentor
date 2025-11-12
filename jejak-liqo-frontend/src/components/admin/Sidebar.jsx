import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  X, 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  FileText,
  Calendar,
  UsersRound,
  Megaphone,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Sidebar = ({ isOpen, isCollapsed, toggleSidebar, activeMenu = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: activeMenu === 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Kelola Mentee', active: activeMenu === 'Kelola Mentee', path: '/admin/kelola-mentee' },
    { icon: UserCheck, label: 'Kelola Mentor', active: activeMenu === 'Kelola Mentor', path: '/admin/kelola-mentor' },
    { icon: FileText, label: 'Kelola Laporan', active: activeMenu === 'Kelola Laporan', path: '/admin/kelola-laporan' },
    { icon: Calendar, label: 'Catatan Pertemuan', active: activeMenu === 'Kelola Pertemuan', path: '/admin/catatan-pertemuan' },
    { icon: UsersRound, label: 'Kelola Kelompok', active: activeMenu === 'Kelola Kelompok', path: '/admin/kelola-kelompok' },
    { icon: Megaphone, label: 'Kelola Pengumuman', active: activeMenu === 'Kelola Pengumuman', path: '/admin/kelola-pengumuman' }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(!isCollapsed || window.innerWidth < 1024) && (
          <motion.aside
            initial={false}
            animate={{ 
              x: window.innerWidth >= 1024 ? 0 : (isOpen ? 0 : -300)
            }}
            exit={{ x: -300 }}
            className={`fixed left-0 top-0 h-screen w-72 shadow-2xl z-50 lg:z-auto transition-colors duration-300 ${
              isDark ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className={`p-4 transition-colors duration-300 ${
                isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    {!isCollapsed && (
                      <div>
                        <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Admin</h2>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dashboard</p>
                      </div>
                    )}
                    {isCollapsed && (
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={toggleSidebar} 
                    className={`lg:hidden transition-colors ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.1 }}  
                    onClick={() => {
                      if (item.path !== '#') {
                        navigate(item.path);
                      }
                    }}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl transition-all ${
                      item.active
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                        : isDark 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <item.icon size={20} />
                    {!isCollapsed && (
                      <>
                        <span className="font-medium">{item.label}</span>
                        {item.active && <ChevronRight className="ml-auto" size={18} />}
                      </>
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* User Profile */}
              <div className={`p-4 transition-colors duration-300 ${
                isDark ? 'border-t border-gray-700' : 'border-t border-gray-200'
              }`}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-xl mb-3 ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                    A
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>Admin</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>admin@sahabatliqo.com</p>
                    </div>
                  )}
                </div>
                
                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutModal(true)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl transition-all text-red-500 hover:bg-red-50 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}
                  title={isCollapsed ? 'Logout' : ''}
                >
                  <LogOut size={20} />
                  {!isCollapsed && (
                    <span className="font-medium">Logout</span>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Konfirmasi Logout
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin keluar dari site ini?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                >
                  Tidak
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setShowLogoutModal(false);
                    navigate('/login');
                    setTimeout(() => {
                      toast.success('Berhasil keluar', { duration: 1500 });
                    }, 100);
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Ya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;