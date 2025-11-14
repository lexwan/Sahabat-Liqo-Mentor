import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../../../components/mentor/Layout";
import EditGroupModal from "../../../components/mentor/EditGroupModal";
import { getMentorGroupDetail } from "../../../api/mentor"
import { User, Calendar, Users, ArrowLeft, MapPin, Phone, Search, Settings, Edit, Trash2, Plus, BookOpen, Eye, X, UserX } from "lucide-react";

const KelolaKelompok = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detail');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [showMenteeModal, setShowMenteeModal] = useState(false);
  const [showAddMenteeDropdown, setShowAddMenteeDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [mentees, setMentees] = useState([]);
  const itemsPerPage = 5;


  const getGroupHeaderImage = (groupId) => {
    const images = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=400&fit=crop&crop=center'
    ];
    return images[groupId % images.length];
  };

  useEffect(() => {
    fetchGroupDetail();
  }, [id]);

  useEffect(() => {
    if (group && activeTab === 'mentee') {
      fetchMentees();
    }
  }, [currentPage, searchQuery, group, activeTab]);

  const fetchGroupDetail = async () => {
    try {
      setLoading(true);
      const response = await getMentorGroupDetail(id);
      setGroup(response.data);
    } catch (error) {
      console.error('Error fetching group detail:', error);
      toast.error('Gagal memuat detail kelompok');
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentees = async () => {
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage
      };
      if (searchQuery) params.search = searchQuery;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mentor/groups/${id}/mentees?${new URLSearchParams(params)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMentees(data.data || []);
        setPagination(data.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching mentees:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleEditGroup = (field = null) => {
    const fieldName = field === 'name' ? 'nama kelompok' : field === 'description' ? 'deskripsi' : 'kelompok';
    
    toast((t) => (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-3">
          <span className="font-medium text-gray-900 dark:text-white">
            Apakah Anda yakin ingin mengedit {fieldName}?
          </span>
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                setEditField(field);
                setShowEditModal(true);
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
            >
              Ya, Edit
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
      style: {
        background: 'transparent',
        boxShadow: 'none'
      }
    });
  };

  const handleGroupUpdate = (updatedGroup) => {
    setGroup(updatedGroup);
  };

  const handleToggleMenteeStatus = async () => {
    if (!selectedMentee) return;
    
    const newStatus = selectedMentee.status === 'Aktif' ? 'Non-Aktif' : 'Aktif';
    const action = selectedMentee.status === 'Aktif' ? 'nonaktifkan' : 'aktifkan';
    
    const confirmToggle = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/mentees/${selectedMentee.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
          const toastId = toast.success(`${selectedMentee.full_name} berhasil di${action}`, { duration: 2000 });
          setTimeout(() => toast.dismiss(toastId), 2000);
          setShowMenteeModal(false);
          fetchGroupDetail();
        } else {
          throw new Error('Failed to update status');
        }
      } catch (error) {
        console.error('Error updating mentee status:', error);
        const toastId = toast.error(`Gagal ${action} mentee`, { duration: 2000 });
        setTimeout(() => toast.dismiss(toastId), 2000);
      }
    };

    toast((t) => (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-3">
          <span className="font-medium text-gray-900 dark:text-white">
            {action === 'nonaktifkan' ? 'Nonaktifkan' : 'Aktifkan'} {selectedMentee.full_name}?
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Status mentee akan diubah menjadi {newStatus}
          </span>
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                confirmToggle();
              }}
              className={`px-4 py-2 text-white rounded-lg text-sm transition-colors ${
                action === 'nonaktifkan' 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              Ya, {action === 'nonaktifkan' ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: 2000,
      position: 'top-center',
      style: {
        background: 'transparent',
        boxShadow: 'none'
      }
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout>
        <div className="p-6 max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Kelompok Tidak Ditemukan
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Silakan gunakan navigasi untuk kembali ke dashboard.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('detail')}
                className={`px-2 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'detail'
                    ? 'text-gray-900 dark:text-white border-b-2 border-blue-600'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Detail
              </button>
              <button
                onClick={() => setActiveTab('mentee')}
                className={`px-2 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'mentee'
                    ? 'text-gray-900 dark:text-white border-b-2 border-blue-600'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Mentee
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-2 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'text-gray-900 dark:text-white border-b-2 border-blue-600'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Settings
              </button>
            </div>
            
            {activeTab === 'mentee' && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setShowAddMenteeDropdown(!showAddMenteeDropdown)}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Plus size={16} className="mr-2" />
                    Tambah Mentee
                  </button>
                  {showAddMenteeDropdown && (
                    <div className="absolute top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          navigate(`/mentor/kelompok/${id}/kelola-mentee`);
                          setShowAddMenteeDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Mentee Baru
                      </button>
                      <button
                        onClick={() => {
                          navigate(`/mentor/kelompok/${id}/kelola-mentee?mode=existing`);
                          setShowAddMenteeDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
                      >
                        Mentee yang Sudah Ada
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari mentee..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              </div>
            )}
          </div>
          
          {activeTab === 'mentee' && (
            <div className="sm:hidden mb-4">
              <div className="flex flex-col space-y-3">
                <div className="relative">
                  <button
                    onClick={() => setShowAddMenteeDropdown(!showAddMenteeDropdown)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Plus size={16} className="mr-2" />
                    Tambah Mentee
                  </button>
                  {showAddMenteeDropdown && (
                    <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          navigate(`/mentor/kelompok/${id}/kelola-mentee`);
                          setShowAddMenteeDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Mentee Baru
                      </button>
                      <button
                        onClick={() => {
                          navigate(`/mentor/kelompok/${id}/kelola-mentee?mode=existing`);
                          setShowAddMenteeDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
                      >
                        Mentee yang Sudah Ada
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari mentee..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}
          
          <hr className="border-gray-200 dark:border-gray-700" />
        </div>


        {activeTab === 'detail' ? (
          <>

            <div className="relative mb-6 rounded-lg overflow-hidden">
              <img
                src={getGroupHeaderImage(group.id)}
                alt="Group Header"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{group.group_name}</h1>
                <p className="text-white/90">{group.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Informasi Kelompok
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {group.description}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={14} className="mr-2" />
                    <span>Dibuat {formatDate(group.created_at)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Users size={14} className="mr-2" />
                    <span>{group.mentees?.length || 0} Mentee</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm6-8a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{group.meetings?.length || 0} Pertemuan</span>
                  </div>
                </div>
              </div>
            </div>


            <div className="col-span-1 lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Detail Kelompok
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Kelompok</h3>
                    <p className="text-gray-900 dark:text-white">{group.group_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</h3>
                    <p className="text-gray-900 dark:text-white">{group.description || 'Tidak ada deskripsi'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mentor</h3>
                    <p className="text-gray-900 dark:text-white">{group.mentor?.profile?.full_name || 'Tidak ada mentor'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </>
        ) : activeTab === 'mentee' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Mentor
              </h2>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  {group.mentor?.profile?.profile_picture ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${group.mentor.profile.profile_picture}`}
                      alt={group.mentor.profile.full_name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        console.log('Image load error:', e.target.src);
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {group.mentor?.profile?.full_name || 'Mentor'}
                    </h3>
                    {group.mentor?.profile?.phone_number && (
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Phone size={12} className="mr-1" />
                        <span>{group.mentor.profile.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>


            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Daftar Mentee ({pagination.total || 0})
                </h2>
                <button
                  onClick={() => navigate(`/mentor/kelompok/${id}/mentee-nonaktif`)}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                >
                  Mentee Non-Aktif
                </button>
              </div>
            
            {mentees.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {mentees.map((mentee, index) => (
                    <div
                      key={mentee.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-sm">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                {mentee.full_name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {mentee.nickname}
                              </p>
                            </div>
                            <button 
                              onClick={() => {
                                setSelectedMentee(mentee);
                                setShowMenteeModal(true);
                              }}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors ml-2 flex-shrink-0"
                            >
                              <Eye size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {pagination.last_page > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Halaman {pagination.current_page} dari {pagination.last_page}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                        {currentPage}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === pagination.last_page}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          currentPage === pagination.last_page
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'Mentee Tidak Ditemukan' : 'Belum Ada Mentee'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'Coba kata kunci lain untuk mencari mentee.' : 'Kelompok ini belum memiliki mentee.'}
                </p>
              </div>
            )}
            </div>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Pengaturan Kelompok
            </h2>
            
            <div className="space-y-4">

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kelompok</h3>
                  <p className="text-gray-900 dark:text-white">{group.group_name}</p>
                </div>
                <button 
                  onClick={() => handleEditGroup('name')}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
              </div>


              <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</h3>
                  <p className="text-gray-900 dark:text-white">{group.description || 'Tidak ada deskripsi'}</p>
                </div>
                <button 
                  onClick={() => handleEditGroup('description')}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
              </div>


              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mentor</h3>
                  <p className="text-gray-900 dark:text-white">{group.mentor?.profile?.full_name || 'Tidak ada mentor'}</p>
                </div>
                <div className="p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed">
                  <Edit size={16} />
                </div>
              </div>


              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Dibuat</h3>
                  <p className="text-gray-900 dark:text-white">{formatDate(group.created_at)}</p>
                </div>
                <div className="p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed">
                  <Edit size={16} />
                </div>
              </div>


              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah Mentee</h3>
                  <p className="text-gray-900 dark:text-white">{group.mentees?.length || 0} orang</p>
                </div>
                <div className="p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed">
                  <Edit size={16} />
                </div>
              </div>


              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Kelompok</h3>
                  <p className="text-gray-900 dark:text-white">Aktif</p>
                </div>
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <Edit size={16} />
                </button>
              </div>
            </div>


            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Hapus Kelompok</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tindakan ini tidak dapat dibatalkan</p>
                </div>
                <button className="flex items-center px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-colors">
                  <Trash2 size={16} className="mr-2" />
                  Hapus Kelompok
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Mentee Detail Modal */}
      {showMenteeModal && selectedMentee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Detail Mentee
              </h2>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => navigate(`/mentor/kelompok/${id}/edit-mentee/${selectedMentee.id}`)}
                  className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit Mentee"
                >
                  <Edit size={16} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleToggleMenteeStatus}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                    selectedMentee.status === 'Aktif' 
                      ? 'text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                  title={selectedMentee.status === 'Aktif' ? 'Nonaktifkan Mentee' : 'Aktifkan Mentee'}
                >
                  <User size={16} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setShowMenteeModal(false)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                >
                  <X size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <User size={20} className="sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedMentee.full_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedMentee.nickname}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</h4>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">{selectedMentee.gender || '-'}</p>
                </div>
                
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Lahir</h4>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                    {selectedMentee.birth_date ? new Date(selectedMentee.birth_date).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Telepon</h4>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">{selectedMentee.phone_number || '-'}</p>
                </div>
                
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kelas</h4>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">{selectedMentee.activity_class || '-'}</p>
                </div>
                
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hobi</h4>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">{selectedMentee.hobby || '-'}</p>
                </div>
                
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</h4>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">{selectedMentee.status || '-'}</p>
                </div>
                
                <div className="sm:col-span-2">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat</h4>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">{selectedMentee.address || '-'}</p>
                </div>
              </div>
              

            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      <EditGroupModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        group={group}
        onUpdate={handleGroupUpdate}
        field={editField}
      />
    </Layout>
  );
};

export default KelolaKelompok;