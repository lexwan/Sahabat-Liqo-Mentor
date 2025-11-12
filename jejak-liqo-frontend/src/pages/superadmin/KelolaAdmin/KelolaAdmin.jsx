import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Layout from '../../../components/superadmin/Layout';
import { DeleteConfirmModal, EditAdminModal } from '../../../components/superadmin/modals';

// Transform backend data to frontend format
const transformAdminData = (backendAdmin) => {
  // Prioritize profile status over user status
  let displayStatus = 'Aktif';
  if (backendAdmin.status === 'blocked') {
    displayStatus = 'Terblokir';
  } else if (backendAdmin.profile?.status === 'Non-Aktif') {
    displayStatus = 'Non-Aktif';
  } else if (backendAdmin.status === 'active') {
    displayStatus = 'Aktif';
  }

  return {
    id: backendAdmin.id,
    foto_profil: backendAdmin.profile?.profile_picture ? `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/storage/${backendAdmin.profile.profile_picture}` : null,
    nama_lengkap: backendAdmin.profile?.full_name || '',
    email: backendAdmin.email,
    peran: backendAdmin.role === 'admin' ? 'Admin' : backendAdmin.role,
    status: displayStatus,
    blocked_at: backendAdmin.blocked_at,
    phone: backendAdmin.profile?.phone_number || '',
    alamat: backendAdmin.profile?.address || '',
    tanggal_bergabung: new Date(backendAdmin.created_at).toLocaleDateString('id-ID'),
    nickname: backendAdmin.profile?.nickname || '',
    birth_date: backendAdmin.profile?.birth_date || '',
    hobby: backendAdmin.profile?.hobby || '',
    job: backendAdmin.profile?.job || '',
    profile_status: backendAdmin.profile?.status || '',
    status_note: backendAdmin.profile?.status_note || '',
    gender: backendAdmin.profile?.gender || ''
  };
};



// Detail Modal
const DetailModal = ({ isOpen, onClose, admin }) => {
  const { isDark } = useTheme();
  if (!isOpen || !admin) return null;

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
          className={`rounded-2xl shadow-2xl w-full max-w-md ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className={`p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>Detail Admin</h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
              {admin.foto_profil ? (
                <img 
                  src={admin.foto_profil} 
                  alt={admin.nama_lengkap}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-[#4DABFF] to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {admin.nama_lengkap.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <div>
                <h4 className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>{admin.nama_lengkap}</h4>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>{admin.peran}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail size={18} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{admin.email}</span>
              </div>
              
              {admin.phone && (
                <div className="flex items-center space-x-3">
                  <Phone size={18} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{admin.phone}</span>
                </div>
              )}
              
              {admin.alamat && (
                <div className="flex items-center space-x-3">
                  <MapPin size={18} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{admin.alamat}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar size={18} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Bergabung: {admin.tanggal_bergabung}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  admin.status === 'Aktif' 
                    ? 'bg-green-500' 
                    : admin.status === 'Terblokir'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                }`} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Status: {admin.status}</span>
              </div>
              
              {admin.blocked_at && (
                <div className="flex items-center space-x-3">
                  <AlertCircle size={18} className="text-red-500" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    Diblokir: {new Date(admin.blocked_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              
              {admin.job && (
                <div className="flex items-center space-x-3">
                  <Users size={18} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Pekerjaan: {admin.job}</span>
                </div>
              )}
              
              {admin.nickname && (
                <div className="flex items-center space-x-3">
                  <Users size={18} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Nickname: {admin.nickname}</span>
                </div>
              )}
              
              {admin.gender && (
                <div className="flex items-center space-x-3">
                  <Users size={18} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Gender: 
                    <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                      admin.gender === 'ikhwan' 
                        ? 'bg-blue-100 text-blue-800' 
                        : admin.gender === 'akhwat'
                        ? 'bg-pink-100 text-pink-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.gender?.charAt(0).toUpperCase() + admin.gender?.slice(1)}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={`p-6 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onClose}
              className={`w-full px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};



// Main Kelola Admin Component
const KelolaAdmin = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [sortBy, setSortBy] = useState('nama_lengkap');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [actionType, setActionType] = useState('');
  const { isDark } = useTheme();





  // Fetch admins from API
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admins?per_page=${itemsPerPage}&page=${currentPage}`);
      
      // Handle new backend response structure
      if (response.data.status === 'success') {
        const backendAdmins = response.data.data.data;
        const transformedAdmins = backendAdmins.map(transformAdminData);
        
        setAdmins(transformedAdmins);
        setTotalItems(response.data.data.total);
      } else {
        throw new Error(response.data.message || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat data admin');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic (client-side for now)
  useEffect(() => {
    let filtered = admins.filter(admin => {
      const matchesSearch = admin.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           admin.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Semua' || admin.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy]?.toLowerCase() || '';
      const bValue = b[sortBy]?.toLowerCase() || '';
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredAdmins(filtered);
  }, [admins, searchTerm, statusFilter, sortBy, sortOrder]);

  // Fetch data on component mount and page change
  useEffect(() => {
    fetchAdmins();
  }, [currentPage, itemsPerPage]);

  // Pagination (server-side)
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAdmins = filteredAdmins;

  // CRUD Operations
  const handleAddAdmin = async (formData) => {
    try {
      const requestData = {
        email: formData.email,
        password: formData.password || 'defaultpass123',
        full_name: formData.nama_lengkap,
        nickname: formData.nickname || '',
        phone_number: formData.phone || '',
        address: formData.alamat || '',
        job: formData.job || '',
        status: formData.profile_status || 'Aktif',
        gender: formData.gender || '',
        status_note: formData.status_note || ''
      };
      
      if (formData.profile_picture) {
        requestData.profile_picture = formData.profile_picture;
      }

      await api.post('/admins', requestData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast.success('Admin berhasil ditambahkan');
      fetchAdmins();
    } catch (error) {
      console.error('Failed to add admin:', error);
      toast.error(error.response?.data?.message || 'Gagal menambahkan admin');
    }
  };

  const handleEditAdmin = async (formData) => {
    try {
      const requestData = {
        email: formData.email,
        full_name: formData.nama_lengkap,
        nickname: formData.nickname || null,
        phone_number: formData.phone || null,
        address: formData.alamat || null,
        job: formData.job || null,
        status: formData.profile_status || 'Aktif',
        gender: formData.gender || null,
        status_note: formData.status_note || null,
        birth_date: formData.birth_date || null,
        hobby: formData.hobby || null
      };
      
      if (formData.password) {
        requestData.password = formData.password;
      }
      
      if (formData.profile_picture) {
        requestData.profile_picture = formData.profile_picture;
      }

      // Handle file upload with FormData if profile picture exists
      let finalData;
      let headers = {};
      
      if (formData.profile_picture) {
        finalData = new FormData();
        Object.keys(requestData).forEach(key => {
          if (requestData[key] !== null) {
            finalData.append(key, requestData[key]);
          }
        });
        finalData.append('profile_picture', formData.profile_picture);
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        finalData = requestData;
        headers['Content-Type'] = 'application/json';
      }

      await api.put(`/admins/${selectedAdmin.id}`, finalData, { headers });
      
      // Show success toast with admin name
      const adminName = formData.nama_lengkap;
      toast.success(`Data admin "${adminName}" berhasil diupdate!`, {
        duration: 4000,
        icon: '✅'
      });
      fetchAdmins();
    } catch (error) {
      console.error('Failed to update admin:', error);
      toast.error(error.response?.data?.message || 'Gagal mengupdate admin');
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      await api.delete(`/admins/${selectedAdmin.id}`);
      toast.success('Admin berhasil dihapus');
      fetchAdmins();
    } catch (error) {
      console.error('Failed to delete admin:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus admin');
    } finally {
      setShowFormModal(false);
      setSelectedAdmin(null);
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      const endpoint = admin.status === 'Aktif' ? 'block' : 'unblock';
      const response = await api.put(`/admins/${admin.id}/${endpoint}`);
      
      if (response.data.status === 'success') {
        const newStatus = admin.status === 'Aktif' ? 'Terblokir' : 'Aktif';
        toast.success(`Admin berhasil ${admin.status === 'Aktif' ? 'diblokir' : 'dibuka blokirnya'}`);
        fetchAdmins();
      } else {
        throw new Error(response.data.message || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
      toast.error(error.response?.data?.message || 'Gagal mengubah status admin');
    }
  };

  return (
    <Layout activeMenu="Kelola Admin">
      <div className="p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className={`text-3xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>Kelola Admin</h1>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Kelola data admin sistem Shaf Pembangunan</p>
          </div>

          {/* Controls */}
          <div className={`rounded-2xl shadow-md p-6 mb-6 border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Cari nama atau email admin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                  <option value="Terblokir">Terblokir</option>
                </select>

                {/* Sort */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4DABFF] focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="nama_lengkap-asc">Nama A-Z</option>
                  <option value="nama_lengkap-desc">Nama Z-A</option>
                  <option value="email-asc">Email A-Z</option>
                  <option value="email-desc">Email Z-A</option>
                  <option value="tanggal_bergabung-desc">Terbaru</option>
                  <option value="tanggal_bergabung-asc">Terlama</option>
                </select>

                {/* Add Button */}
                <Link to="/superadmin/add-admin">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-[#4DABFF] to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                  >
                    <Plus size={20} />
                    <span>Tambah Admin</span>
                  </motion.button>
                </Link>
                
                {/* Recycle Bin Button */}
                <Link to="/superadmin/recycle-bin">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                  >
                    <Trash2 size={20} />
                    <span>Recycle Bin</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>

          {/* Table - Desktop & Tablet */}
          <div className={`hidden md:block rounded-2xl shadow-md border overflow-hidden ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4DABFF] mx-auto mb-4"></div>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Memuat data admin...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>No</th>
                    <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Admin</th>
                    <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Email</th>
                    <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Status</th>
                    <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Kontrol</th>
                    <th className={`px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Aksi</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {currentAdmins.map((admin, index) => (
                    <motion.tr
                      key={admin.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`px-4 py-4 text-sm font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {startIndex + index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {admin.foto_profil ? (
                            <img 
                              src={admin.foto_profil} 
                              alt={admin.nama_lengkap}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 bg-gradient-to-br from-[#4DABFF] to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-gray-200 ${
                            admin.foto_profil ? 'hidden' : 'flex'
                          }`}>
                            {admin.nama_lengkap.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-medium truncate ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`} title={admin.nama_lengkap}>{admin.nama_lengkap}</div>
                            <div className={`text-xs ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>{admin.peran}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div className="truncate max-w-xs" title={admin.email}>{admin.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          admin.status === 'Aktif'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : admin.status === 'Terblokir'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            admin.status === 'Aktif'
                              ? 'bg-green-500'
                              : admin.status === 'Terblokir'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`} />
                          {admin.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(admin)}
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                            admin.status === 'Aktif'
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          }`}
                        >
                          {admin.status === 'Aktif' ? (
                            <><EyeOff size={12} className="mr-1" />Block</>
                          ) : (
                            <><Eye size={12} className="mr-1" />Unblock</>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setShowFormModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 border border-green-200 hover:border-green-300"
                            title="Edit Admin"
                          >
                            <Edit size={16} />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setActionType('delete');
                              setShowConfirmModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                            title="Hapus Admin"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Cards - Mobile */}
          <div className={`md:hidden space-y-4 ${
            loading ? 'hidden' : 'block'
          }`}>
            {loading ? (
              <div className={`rounded-2xl shadow-md p-8 text-center border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4DABFF] mx-auto mb-4"></div>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Memuat data admin...</p>
              </div>
            ) : (
              currentAdmins.map((admin, index) => (
                <motion.div
                  key={admin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-2xl shadow-md border p-4 ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {admin.foto_profil ? (
                        <img 
                          src={admin.foto_profil} 
                          alt={admin.nama_lengkap}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-[#4DABFF] to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {admin.nama_lengkap.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <h3 className={`font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{admin.nama_lengkap}</h3>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>{admin.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      admin.status === 'Aktif'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : admin.status === 'Terblokir'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        admin.status === 'Aktif'
                          ? 'bg-green-500'
                          : admin.status === 'Terblokir'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                      }`} />
                      {admin.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {admin.peran}
                      </span>
                      <span className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>#{startIndex + index + 1}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleToggleStatus(admin)}
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                          admin.status === 'Aktif'
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        }`}
                      >
                        {admin.status === 'Aktif' ? (
                          <><EyeOff size={12} className="mr-1" />Block</>
                        ) : (
                          <><Eye size={12} className="mr-1" />Unblock</>
                        )}
                      </button>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-blue-200"
                          title="Detail"
                        >
                          <Eye size={16} />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowFormModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all border border-green-200"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setActionType('delete');
                            setShowConfirmModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all border border-red-200"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`rounded-2xl shadow-md border p-4 mt-4 ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} dari {totalItems} admin
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      isDark 
                        ? 'border-gray-600 hover:bg-gray-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            currentPage === page
                              ? 'bg-[#4DABFF] text-white'
                              : isDark 
                                ? 'text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      isDark 
                        ? 'border-gray-600 hover:bg-gray-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredAdmins.length === 0 && (
            <div className={`rounded-2xl shadow-md p-12 text-center border ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <Users size={48} className={`mx-auto mb-4 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Tidak ada admin ditemukan</h3>
              <p className={`mb-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {searchTerm || statusFilter !== 'Semua' 
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Belum ada admin yang terdaftar dalam sistem'
                }
              </p>
              {!searchTerm && statusFilter === 'Semua' && (
                <Link to="/superadmin/add-admin">
                  <button className="px-6 py-2 bg-gradient-to-r from-[#4DABFF] to-blue-600 text-white rounded-lg hover:shadow-lg transition-all">
                    Tambah Admin Pertama
                  </button>
                </Link>
              )}
            </div>
          )}
      </div>

      {/* Modals */}
      <EditAdminModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
        onSave={handleEditAdmin}
      />

      <DetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
      />

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedAdmin(null);
          setActionType('');
        }}
        onConfirm={actionType === 'delete' ? handleDeleteAdmin : () => {}}
        title="Hapus Admin"
        message={`Apakah Anda yakin ingin menghapus admin "${selectedAdmin?.nama_lengkap}"? Tindakan ini tidak dapat dibatalkan.`}
        type="danger"
      />
    </Layout>
  );
};

export default KelolaAdmin;