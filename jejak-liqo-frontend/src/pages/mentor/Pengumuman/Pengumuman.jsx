import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Calendar,
  User,
  Clock,
  X,
  File
} from 'lucide-react';
import Layout from '../../../components/mentor/Layout';

const transformAnnouncementData = (backendAnnouncement) => ({
  id: backendAnnouncement.id,
  title: backendAnnouncement.title,
  content: backendAnnouncement.content,
  author: backendAnnouncement.user?.email || 'Unknown',
  author_role: backendAnnouncement.user?.role || 'admin',
  file_path: backendAnnouncement.file_path,
  file_type: backendAnnouncement.file_type,
  created_at: backendAnnouncement.created_at,
  updated_at: backendAnnouncement.updated_at,
  tanggal_dibuat: new Date(backendAnnouncement.created_at).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }),
  waktu_dibuat: new Date(backendAnnouncement.created_at).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
});

const DetailModal = ({ isOpen, onClose, announcement }) => {
  const { isDark } = useTheme();
  if (!isOpen || !announcement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`rounded-2xl shadow-2xl w-full max-w-2xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className={`p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>Detail Pengumuman</h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h4 className={`text-lg font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>{announcement.title}</h4>
              
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <div className={`flex items-center space-x-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <User size={16} />
                  <span>{announcement.author}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    announcement.author_role === 'admin' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {announcement.author_role === 'admin' ? 'Admin' : 'Super Admin'}
                  </span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Calendar size={16} />
                  <span>{announcement.tanggal_dibuat}</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Clock size={16} />
                  <span>{announcement.waktu_dibuat}</span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <p className={`whitespace-pre-wrap leading-relaxed ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>{announcement.content}</p>
              
              {announcement.file_path && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                    isDark ? 'bg-gray-600' : 'bg-white'
                  }`}>
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                      <File size={20} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>File Lampiran</p>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>{announcement.file_type || 'File'}</p>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/storage/${announcement.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Buka
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Pengumuman = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const { isDark } = useTheme();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mentor/announcements?per_page=${itemsPerPage}&page=${currentPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        const announcementData = data.data;
        const backendAnnouncements = announcementData.data || announcementData;
        const transformedAnnouncements = backendAnnouncements.map(transformAnnouncementData);
        
        setAnnouncements(transformedAnnouncements);
        setTotalItems(announcementData.total || backendAnnouncements.length);
      } else {
        throw new Error(data.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      toast.error('Gagal memuat data pengumuman');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = announcements.filter(announcement => {
      return announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    });

    filtered.sort((a, b) => {
      const aValue = sortBy === 'created_at' ? new Date(a.created_at) : a[sortBy]?.toLowerCase() || '';
      const bValue = sortBy === 'created_at' ? new Date(b.created_at) : b[sortBy]?.toLowerCase() || '';
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredAnnouncements(filtered);
  }, [announcements, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <Layout>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className={`text-3xl font-bold mb-2 flex items-center ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Pengumuman
          </h1>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Daftar pengumuman sistem Shaf Pembangunan</p>
        </div>

        <div className={`rounded-2xl shadow-md p-6 mb-6 border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Cari judul atau konten pengumuman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="created_at-desc">Terbaru</option>
              <option value="created_at-asc">Terlama</option>
              <option value="title-asc">Judul A-Z</option>
              <option value="title-desc">Judul Z-A</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className={`rounded-2xl shadow-md p-8 text-center border ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Memuat data pengumuman...</p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`rounded-2xl shadow-lg border p-6 cursor-pointer transition-all duration-300 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:shadow-2xl hover:border-orange-500/50' 
                    : 'bg-white border-gray-100 hover:shadow-2xl hover:border-orange-300'
                }`}
                onClick={() => {
                  setSelectedAnnouncement(announcement);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 line-clamp-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{announcement.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className={`flex items-center space-x-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <User size={16} className="text-orange-500" />
                        <span>{announcement.author}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          announcement.author_role === 'admin' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          {announcement.author_role === 'admin' ? 'Admin' : 'Super Admin'}
                        </span>
                      </div>
                      
                      <div className={`flex items-center space-x-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <Calendar size={16} className="text-orange-500" />
                        <span>{announcement.tanggal_dibuat}</span>
                      </div>
                      
                      <div className={`flex items-center space-x-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <Clock size={16} className="text-orange-500" />
                        <span>{announcement.waktu_dibuat}</span>
                      </div>
                      
                      {announcement.file_path && (
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                          isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                        }`}>
                          <File size={12} />
                          <span>Lampiran</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold ${
                      isDark ? 'shadow-lg' : 'shadow-md'
                    }`}>
                      <Megaphone size={20} />
                    </div>
                  </div>
                </div>
                
                <div className={`mb-4 p-4 rounded-xl ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <p className={`text-sm line-clamp-3 leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>{announcement.content}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    isDark 
                      ? 'bg-orange-500/20 text-orange-400' 
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    #{startIndex + index + 1}
                  </span>
                  
                  <div className="flex items-center space-x-2 text-sm text-orange-500">
                    <Eye size={16} />
                    <span className="font-medium">Baca Selengkapnya</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {filteredAnnouncements.length === 0 && !loading && (
          <div className={`rounded-2xl shadow-md p-12 text-center border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <Megaphone size={48} className={`mx-auto mb-4 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>Tidak ada pengumuman ditemukan</h3>
            <p className={`mb-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {searchTerm 
                ? 'Coba ubah kata kunci pencarian'
                : 'Belum ada pengumuman yang dibuat'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`mt-8 flex items-center justify-center space-x-2 p-4 rounded-xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                  : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-orange-500 text-white'
                        : isDark
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                  : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <DetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedAnnouncement(null);
        }}
        announcement={selectedAnnouncement}
      />
    </Layout>
  );
};

export default Pengumuman;