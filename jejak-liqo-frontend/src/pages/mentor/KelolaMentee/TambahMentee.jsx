import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../../../components/mentor/Layout";
import { getMentorGroupDetail, addMentees, addAvailableMenteesToGroup, moveMenteesToGroup } from "../../../api/mentor";
import { getAllMentees } from "../../../api/mentee";
import { ArrowLeft, User, Phone, MapPin, Calendar, Plus, Trash2, Users, BookOpen, Heart, Search, Check, UserPlus } from "lucide-react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, selectedNames, groupName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="rounded-2xl shadow-2xl w-full max-w-sm bg-white dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <UserPlus size={32} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Konfirmasi Tambah Mentee
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Apakah Anda yakin ingin menambahkan {selectedNames.length} mentee ke {groupName}?
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 rounded-lg text-white transition-all bg-blue-600 hover:bg-blue-700"
            >
              Ya, Tambahkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExistingMenteeSelector = ({ groupId, user, onBack, group }) => {
  const [allMentees, setAllMentees] = useState([]);
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMentees, setLoadingMentees] = useState(true);
  const [filterType, setFilterType] = useState('available'); // 'all', 'available', 'hasGroup'
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllMentees();
  }, []);

  const fetchAllMentees = async () => {
    try {
      setLoadingMentees(true);
      const response = await getAllMentees();
      const filteredMentees = response.data.filter(mentee => 
        mentee.gender === user?.profile?.gender
      );
      setAllMentees(filteredMentees);
    } catch (error) {
      console.error('Error fetching mentees:', error);
      toast.error('Gagal memuat daftar mentee');
    } finally {
      setLoadingMentees(false);
    }
  };

  const handleMenteeToggle = (menteeId) => {
    setSelectedMentees(prev => 
      prev.includes(menteeId) 
        ? prev.filter(id => id !== menteeId)
        : [...prev, menteeId]
    );
  };

  const handleSubmit = async () => {
    if (selectedMentees.length === 0) {
      toast.error('Pilih minimal satu mentee');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmAddMentees = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      if (filterType === 'available') {
        await addAvailableMenteesToGroup(groupId, selectedMentees);
      } else {
        await moveMenteesToGroup(groupId, selectedMentees);
      }
      toast.success(`${selectedMentees.length} mentee berhasil ditambahkan`, { duration: 2000 });
      navigate(`/mentor/kelompok/${groupId}`);
    } catch (error) {
      console.error('Error adding mentees:', error);
      toast.error('Gagal menambahkan mentee');
    } finally {
      setLoading(false);
    }
  };

  const filteredMentees = allMentees.filter(mentee => {
    const matchesSearch = mentee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentee.nickname?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'available') {
      return matchesSearch && mentee.group_id === null;
    } else if (filterType === 'hasGroup') {
      return matchesSearch && mentee.group_id !== null;
    }
    return matchesSearch;
  });

  const getSelectedMenteeNames = () => {
    return allMentees
      .filter(mentee => selectedMentees.includes(mentee.id))
      .map(mentee => mentee.full_name);
  };

  if (loadingMentees) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAddMentees}
        selectedNames={getSelectedMenteeNames()}
        groupName={group?.name || 'kelompok ini'}
      />
      <div className="flex gap-6">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
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

        {/* Radio Button Filter */}
        <div className="mb-6">
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="filterType"
                value="available"
                checked={filterType === 'available'}
                onChange={(e) => setFilterType(e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Mentee Tersedia</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="filterType"
                value="hasGroup"
                checked={filterType === 'hasGroup'}
                onChange={(e) => setFilterType(e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Mentee yang Sudah Ada Grup (Pindah Grup)</span>
            </label>
          </div>
        </div>

        {filteredMentees.length > 0 ? (
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {filteredMentees.map((mentee) => {
            const hasGroup = mentee.group_id !== null;
            const isSelected = selectedMentees.includes(mentee.id);
            
            return (
              <div
                key={mentee.id}
                onClick={() => handleMenteeToggle(mentee.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : hasGroup
                      ? 'border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      hasGroup ? 'bg-orange-500' : 'bg-green-500'
                    }`}>
                      <User size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {mentee.full_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mentee.nickname} • {hasGroup ? 'Sudah dalam kelompok' : 'Tersedia'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      hasGroup 
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {hasGroup ? 'Sudah ada grup' : 'Tersedia'}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        ) : (
          <div className="text-center py-8 mb-6">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'Mentee Tidak Ditemukan' : 'Tidak Ada Mentee'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Coba kata kunci lain' : 'Belum ada mentee yang tersedia'}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedMentees.length} mentee dipilih
          </p>


          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedMentees.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {loading ? 'Menambahkan...' : `Tambah ${selectedMentees.length} Mentee`}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="w-80 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Mentee Terpilih
        </h3>
        {selectedMentees.length > 0 ? (
          <div className="space-y-3">
            {getSelectedMenteeNames().map((name, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{name}</span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total: {selectedMentees.length} mentee
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users size={32} className="mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Belum ada mentee yang dipilih
            </p>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

const TambahMentee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [group, setGroup] = useState(null);
  const [user, setUser] = useState(null);
  const [mentees, setMentees] = useState([{
    full_name: "",
    nickname: "",
    phone_number: "",
    birth_date: "",
    class: "",
    hobby: "",
    address: "",
    status: "active"
  }]);
  const [loading, setLoading] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(true);

  useEffect(() => {
    fetchGroupDetail();
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [id]);

  const fetchGroupDetail = async () => {
    try {
      setLoadingGroup(true);
      const response = await getMentorGroupDetail(id);
      setGroup(response.data);
    } catch (error) {
      console.error('Error fetching group detail:', error);
      toast.error('Gagal memuat detail kelompok');
    } finally {
      setLoadingGroup(false);
    }
  };

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    setMentees(prev => prev.map((mentee, i) => 
      i === index ? { ...mentee, [name]: value } : mentee
    ));
  };

  const addMenteeForm = () => {
    setMentees(prev => [...prev, {
      full_name: "",
      nickname: "",
      phone_number: "",
      birth_date: "",
      class: "",
      hobby: "",
      address: "",
      status: "active"
    }]);
  };

  const removeMenteeForm = (index) => {
    if (mentees.length > 1) {
      setMentees(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const menteesWithGender = mentees.map(mentee => ({
        ...mentee,
        gender: user?.profile?.gender || 'Ikhwan'
      }));
      
      await addMentees(id, menteesWithGender);
      toast.success('Tambah mentee berhasil');
      navigate(`/mentor/kelompok/${id}`);
    } catch (error) {
      console.error('Error adding mentees:', error);
      toast.error('Gagal menambahkan mentee');
    } finally {
      setLoading(false);
    }
  };

  if (loadingGroup) {
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {mode === 'existing' ? 'Tambah Mentee yang Sudah Ada' : 'Tambah Mentee Baru'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'existing' ? 'Pilih mentee yang sudah ada untuk ditambahkan ke kelompok ini.' : 'Tambahkan mentee baru ke dalam kelompok ini.'}
          </p>
        </div>

        {mode === 'existing' ? (
          <ExistingMenteeSelector groupId={id} user={user} group={group} onBack={() => navigate(`/mentor/kelompok/${id}`)} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {mentees.map((mentee, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Mentee {index + 1}
                  </h3>
                  {mentees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMenteeForm(index)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={mentee.full_name}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={mentee.phone_number}
                    onChange={(e) => handleInputChange(index, e)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    value={mentee.nickname}
                    onChange={(e) => handleInputChange(index, e)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Masukkan nama panggilan"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alamat
                  </label>
                  <textarea
                    name="address"
                    value={mentee.address}
                    onChange={(e) => handleInputChange(index, e)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <input
                    type="text"
                    value={user?.profile?.gender || 'Ikhwan'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={mentee.birth_date}
                    onChange={(e) => handleInputChange(index, e)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kelas
                  </label>
                  <input
                    type="text"
                    name="class"
                    value={mentee.class}
                    onChange={(e) => handleInputChange(index, e)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Masukkan kelas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hobi
                  </label>
                  <input
                    type="text"
                    name="hobby"
                    value={mentee.hobby}
                    onChange={(e) => handleInputChange(index, e)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Masukkan hobi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <input
                    type="text"
                    value="Aktif"
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            ))}
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={addMenteeForm}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Plus size={16} className="mr-2" />
                Tambah Mentee Lain
              </button>
              
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(`/mentor/kelompok/${id}`)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  {loading ? 'Menyimpan...' : `Tambah ${mentees.length} Mentee`}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default TambahMentee;