import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Clock, FileText, Camera, Search, UserCheck, UserX, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../../../components/mentor/Layout';
import { createMeeting, getMentorGroups, getMentorGroupDetail } from '../../../api/mentor';

const TambahPertemuan = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Initialize mentee attendance status
  useEffect(() => {
    setMentees(prev => prev.map(mentee => ({
      ...mentee,
      attendance_status: mentee.attendance_status || 'hadir',
      attendance_note: mentee.attendance_note || ''
    })));
  }, []);
  const [searchGroup, setSearchGroup] = useState('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [formData, setFormData] = useState({
    group_id: '',
    topic: '',
    meeting_date: '',
    meeting_type: 'offline',
    place: '',
    notes: '',
    photos: []
  });

  useEffect(() => {
    if (groupId) {
      setFormData(prev => ({ ...prev, group_id: groupId }));
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (formData.group_id && formData.group_id !== '' && formData.group_id !== 'undefined') {
      fetchMentees(formData.group_id);
    }
  }, [formData.group_id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.group-dropdown')) {
        setShowGroupDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await getMentorGroups();
      setGroups(data.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchMentees = async (groupId) => {
    if (!groupId) return;
    try {
      const data = await getMentorGroupDetail(groupId);
      const activeMentees = (data.data?.mentees || [])
        .filter(mentee => mentee.status === 'Aktif')
        .map(mentee => ({
          ...mentee,
          attendance_status: 'hadir',
          attendance_note: ''
        }));
      setMentees(activeMentees);
    } catch (error) {
      console.error('Error fetching mentees:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGroupSelect = (group) => {
    setFormData(prev => ({ ...prev, group_id: group.id }));
    setSearchGroup('');
    setShowGroupDropdown(false);
  };

  const filteredGroups = groups.filter(group => 
    group.group_name.toLowerCase().includes(searchGroup.toLowerCase())
  );

  const selectedGroup = groups.find(g => g.id == formData.group_id);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    
    try {
      const attendances = mentees.map(mentee => ({
        mentee_id: mentee.id,
        status: mentee.attendance_status || 'hadir',
        note: mentee.attendance_note || ''
      }));

      const submitData = {
        ...formData,
        attendances
      };

      const response = await createMeeting(submitData);
      
      if (response.status === 'success') {
        setToast({ type: 'success', message: 'Pertemuan berhasil ditambahkan!' });
        setTimeout(() => {
          const toastData = { type: 'success', message: 'Pertemuan berhasil ditambahkan!' };
          localStorage.setItem('toast', JSON.stringify(toastData));
          navigate('/mentor/catatan-pertemuan');
        }, 2000);
      } else {
        setToast({ type: 'error', message: 'Gagal menambahkan pertemuan!' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Gagal menambahkan pertemuan!' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tambah Pertemuan
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group-dropdown">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Kelompok
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedGroup?.group_name || searchGroup}
                  onChange={(e) => {
                    setSearchGroup(e.target.value);
                    if (!selectedGroup) {
                      setShowGroupDropdown(true);
                    }
                  }}
                  onFocus={() => {
                    if (!selectedGroup) {
                      setShowGroupDropdown(true);
                    }
                  }}
                  onClick={() => {
                    if (selectedGroup) {
                      setFormData(prev => ({ ...prev, group_id: '' }));
                      setSearchGroup('');
                      setShowGroupDropdown(true);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
                  placeholder="Pilih atau cari kelompok"
                  required
                />
                <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {showGroupDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredGroups.length > 0 ? (
                      filteredGroups.map((group) => (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => handleGroupSelect(group)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none"
                        >
                          <div className="text-gray-900 dark:text-white">{group.group_name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {group.description || 'Tidak ada deskripsi'}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
                        Kelompok tidak ditemukan
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tanggal Pertemuan
                </label>
                <input
                  type="date"
                  name="meeting_date"
                  value={formData.meeting_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipe Pertemuan
                </label>
                <select
                  name="meeting_type"
                  value={formData.meeting_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topik Pertemuan
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Masukkan topik pertemuan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formData.meeting_type === 'online' ? 'Link Meeting/Zoom' : 'Tempat Pertemuan'}
                </label>
                <input
                  type="text"
                  name="place"
                  value={formData.place}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={formData.meeting_type === 'online' ? 'https://zoom.us/j/...' : 'Nama tempat pertemuan'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catatan Pertemuan (Opsional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Catatan tambahan untuk pertemuan ini"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Foto Pertemuan
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <div className="text-center">
                  <Camera size={48} className="mx-auto text-gray-400 mb-4" />
                  <div className="flex justify-center text-sm text-gray-600 dark:text-gray-400">
                    <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload foto</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">atau drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              
              {formData.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {formData.group_id && mentees.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Daftar Kehadiran Mentee
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setMentees(prev => prev.map(m => ({ ...m, attendance_status: 'hadir', attendance_note: '' })));
                    }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                </div>
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-5 gap-3 mb-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{mentees.length}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-xs text-green-600 dark:text-green-400">Hadir</p>
                    </div>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">{mentees.filter(m => m.attendance_status === 'hadir').length}</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">Sakit</p>
                    </div>
                    <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{mentees.filter(m => m.attendance_status === 'sakit').length}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Izin</p>
                    </div>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{mentees.filter(m => m.attendance_status === 'izin').length}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <p className="text-xs text-red-600 dark:text-red-400">Alpha</p>
                    </div>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">{mentees.filter(m => m.attendance_status === 'alpha').length}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {mentees.map((mentee) => {
                    const status = mentee.attendance_status || 'hadir';
                    const statusConfig = {
                      hadir: { color: 'green', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', icon: 'UserCheck' },
                      sakit: { color: 'yellow', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', icon: 'Clock' },
                      izin: { color: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: 'AlertCircle' },
                      alpha: { color: 'red', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', icon: 'UserX' }
                    };
                    
                    return (
                      <div key={mentee.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig[status].bg}`}>
                          {status === 'hadir' && <UserCheck size={14} className={statusConfig[status].text} />}
                          {status === 'sakit' && <Clock size={14} className={statusConfig[status].text} />}
                          {status === 'izin' && <AlertCircle size={14} className={statusConfig[status].text} />}
                          {status === 'alpha' && <UserX size={14} className={statusConfig[status].text} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {mentee.full_name || mentee.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {mentee.nickname || 'Tidak ada panggilan'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium ${statusConfig[status].text} capitalize`}>
                            {status}
                          </span>
                          <select
                            value={status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              setMentees(prev => prev.map(m => 
                                m.id === mentee.id ? { ...m, attendance_status: newStatus } : m
                              ));
                            }}
                            className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="hadir">Hadir</option>
                            <option value="sakit">Sakit</option>
                            <option value="izin">Izin</option>
                            <option value="alpha">Alpha</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Catatan (opsional)"
                            value={mentee.attendance_note || ''}
                            onChange={(e) => {
                              setMentees(prev => prev.map(m => 
                                m.id === mentee.id ? { ...m, attendance_note: e.target.value } : m
                              ));
                            }}
                            className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-32 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !formData.group_id}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Menyimpan...' : 'Simpan Pertemuan'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <FileText size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                Konfirmasi Simpan
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Apakah Anda yakin ingin menambah pertemuan baru?
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Menyimpan...' : 'Ya, Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <XCircle size={20} />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TambahPertemuan;