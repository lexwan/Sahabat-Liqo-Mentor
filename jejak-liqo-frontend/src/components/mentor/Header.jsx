import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Plus, User, LogOut, ChevronDown } from 'lucide-react';

const Header = ({ title, showAddButton = false, onAddClick }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {showAddButton && (
            <button
              onClick={onAddClick}
              className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors"
            >
              <Plus size={18} />
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-sm transition-colors`}
            >
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Mentor Ahmad
              </span>
              <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            
            {showDropdown && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border z-50`}>
                <div className="py-1">
                  <button
                    onClick={() => setShowDropdown(false)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center space-x-2">
                      <User size={16} />
                      <span>Lihat Profil</span>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <LogOut size={16} />
                      <span>Logout</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;