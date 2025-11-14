import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Menu, X, LogOut, User, ChevronDown, Plus, FileText, Bell, UserCircle, Settings } from 'lucide-react';
import { logout } from '../../api/auth';
import toast from 'react-hot-toast';
import LogoutConfirmModal from '../ui/LogoutConfirmModal';
import logoLight from '../../assets/images/logo/LogoShaf_Terang.png';
import logoDark from '../../assets/images/logo/LogoShaf_Gelap.png';

const Layout = ({ children, /*activeMenu*/ }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    // Fetch fresh profile data
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mentor/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/mentor/dashboard' },
    { name: 'Catat Pertemuan', icon: FileText, path: '/mentor/catatan-pertemuan' },
    { name: 'Pengumuman', icon: Bell, path: '/mentor/pengumuman' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.setItem('showLogoutSuccessToast', 'true');
      navigate('/login');
    } catch (error) {
      toast.error('Gagal logout, coba lagi.');
    }
    setShowLogoutModal(false);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-50 dark:bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 h-16 ${
        isDark ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-white border-gray-200'
      } border-b shadow-sm`}>
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left: Logo & Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
            >
              <Menu size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            <div className="flex items-center space-x-3">
              <img 
                src={isDark ? logoLight : logoDark} 
                alt="Sahabat Liqo" 
                className="w-8 h-8 object-contain"
              />
              <h1 className={`text-xl font-medium ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                Sahabat Liqo
              </h1>
            </div>
          </div>

          {/* Right: Add Group, Theme & Profile */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                title="Tambah"
              >
                <Plus size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
              
              {showAddMenu && (
                <div className={`absolute right-0 mt-2 w-48 ${
                  isDark ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-white border-gray-200'
                } border rounded-lg shadow-lg py-1 z-50`}>
                  <button
                    onClick={() => {
                      navigate('/mentor/kelompok/tambah');
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Buat Kelompok Baru
                  </button>
                </div>
              )}
            </div>
            

            
            {/* Profile Dropdown */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.profile?.profile_picture ? (
                    <img 
                      src={`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/storage/${user.profile.profile_picture}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-white" />
                  )}
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                    {user?.profile?.name || user?.name || 'Mentor'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500'}`}>
                    {user?.email}
                  </p>
                </div>
                <ChevronDown size={16} className={`${isDark ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500'} transition-transform ${
                  showProfileMenu ? 'rotate-180' : ''
                }`} />
              </button>
              
              {/* Profile Menu */}
              {showProfileMenu && (
                <div className={`absolute right-0 mt-2 w-48 sm:w-56 md:w-64 lg:w-48 ${
                  isDark ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-white border-gray-200'
                } border rounded-lg shadow-lg py-1 z-[60]`}>
                  <div className="px-3 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className={`text-xs sm:text-sm font-medium truncate ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                      {user?.profile?.name || user?.name || 'Mentor'}
                    </p>
                    <p className={`text-xs truncate ${isDark ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500'}`}>
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowProfileMenu(false);
                      navigate('/mentor/settings');
                    }}
                    className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <Settings size={14} className="sm:w-4 sm:h-4" />
                    <span>Settings</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <div className={`hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:top-16 ${
        isDark ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-white border-gray-200'
      } border-r`}>
        <div className="flex flex-col flex-1">
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : isDark
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>



      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          <div className={`relative flex flex-col w-64 ${
            isDark ? 'bg-white dark:bg-gray-800' : 'bg-white'
          } shadow-xl`}>
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <img 
                  src={isDark ? logoLight : logoDark} 
                  alt="Sahabat Liqo" 
                  className="w-8 h-8 object-contain"
                />
                <h1 className={`text-xl font-medium ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                  Sahabat Liqo
                </h1>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                <X size={20} className={isDark ? 'text-gray-600 dark:text-gray-300' : 'text-gray-600'} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : isDark
                        ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 ${
        isDark ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-white border-gray-200'
      } border-t shadow-lg`}>
        <div className="flex">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex-1 flex flex-col items-center py-2 px-2 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : isDark
                    ? 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon size={22} className="mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            );
          })}
          
          {/* Profile Button */}
          <div className="flex-1 relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`w-full flex flex-col items-center py-2 px-2 transition-colors ${
                isDark
                  ? 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-1 overflow-hidden">
                {user?.profile?.profile_picture ? (
                  <img 
                    src={`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/storage/${user.profile.profile_picture}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={14} className="text-white" />
                )}
              </div>
              <span className="text-xs font-medium">Profile</span>
            </button>
            
            {/* Mobile Profile Dropdown - Opens Upward */}
            {showProfileMenu && (
              <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-40 xs:w-44 sm:w-48 ${
                isDark ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-white border-gray-200'
              } border rounded-lg shadow-lg py-1 z-[80]`}>
                <div className="px-2 xs:px-3 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className={`text-xs xs:text-sm font-medium truncate ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                    {user?.profile?.name || user?.name || 'Mentor'}
                  </p>
                  <p className={`text-xs truncate ${isDark ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500'}`}>
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowProfileMenu(false);
                    navigate('/mentor/settings');
                  }}
                  className="w-full text-left px-2 xs:px-3 sm:px-4 py-2 text-xs xs:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1 xs:space-x-2 cursor-pointer"
                >
                  <Settings size={14} className="xs:w-4 xs:h-4" />
                  <span>Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pt-16">
        <main className="pb-16 lg:pb-0 min-h-screen">
          {children}
        </main>
      </div>

      {/* Click outside to close menus */}
      {(showProfileMenu || showAddMenu) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowProfileMenu(false);
            setShowAddMenu(false);
          }}
        />
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Layout;