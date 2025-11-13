import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../../../components/mentor/Layout";
import { getMentorGroupDetail } from "../../../api/mentor";
import { ArrowLeft, User, Search, Eye, X } from "lucide-react";

const MenteeNonAktif = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [showMenteeModal, setShowMenteeModal] = useState(false);

  useEffect(() => {
    fetchGroupDetail();
  }, [id]);

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

  const handleActivateMentee = async () => {
    if (!selectedMentee) return;
    
    const confirmActivate = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/mentees/${selectedMentee.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status: 'Aktif' })
        });
        
        if (response.ok) {
          const toastId = toast.success(`${selectedMentee.full_name} berhasil diaktifkan`, { duration: 2000 });
          setTimeout(() => toast.dismiss(toastId), 2000);
          setShowMenteeModal(false);
          fetchGroupDetail();
        } else {
          throw new Error('Failed to update status');
        }
      } catch (error) {
        console.error('Error updating mentee status:', error);
        const toastId = toast.error('Gagal aktifkan mentee', { duration: 2000 });
        setTimeout(() => toast.dismiss(toastId), 2000);
      }
    };

    toast((t) => (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-3">
          <span className="font-medium text-gray-900 dark:text-white">
            Aktifkan {selectedMentee.full_name}?
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Status mentee akan diubah menjadi Aktif
          </span>
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                confirmActivate();
              }}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
            >
              Ya, Aktifkan
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
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const inactiveMentees = group?.mentees?.filter(mentee => mentee.status === 'Non-Aktif') || [];
  const filteredMentees = inactiveMentees.filter(mentee =>
    mentee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentee.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/mentor/kelompok/${id}`)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Kelompok
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Mentee Non-Aktif
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Daftar mentee yang berstatus non-aktif dalam kelompok {group?.group_name}
              </p>
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
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daftar Mentee Non-Aktif ({filteredMentees.length})
          </h2>

          {filteredMentees.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredMentees.map((mentee) => (
                <div
                  key={mentee.id}
                  className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-white" />
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
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                            Non-Aktif
                          </span>
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
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'Mentee Tidak Ditemukan' : 'Tidak Ada Mentee Non-Aktif'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Coba kata kunci lain untuk mencari mentee.' : 'Semua mentee dalam kelompok ini berstatus aktif.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mentee Detail Modal */}
      {showMenteeModal && selectedMentee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Detail Mentee Non-Aktif
              </h2>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={handleActivateMentee}
                  className="p-1.5 sm:p-2 text-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Aktifkan Mentee"
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
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
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
                  <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                    {selectedMentee.status}
                  </span>
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
    </Layout>
  );
};

export default MenteeNonAktif;