import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../../../components/mentor/Layout";
import { ArrowLeft, User, Save } from "lucide-react";

const EditMentee = () => {
  const { id, menteeId } = useParams();
  const navigate = useNavigate();
  const [mentee, setMentee] = useState({
    full_name: "",
    nickname: "",
    phone_number: "",
    birth_date: "",
    activity_class: "",
    hobby: "",
    address: "",
    gender: "",
    status: ""
  });
  const [loading, setLoading] = useState(false);
  const [loadingMentee, setLoadingMentee] = useState(true);

  useEffect(() => {
    fetchMenteeDetail();
  }, [menteeId]);

  const fetchMenteeDetail = async () => {
    try {
      setLoadingMentee(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mentees/${menteeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMentee({
          full_name: data.data.full_name || "",
          nickname: data.data.nickname || "",
          phone_number: data.data.phone_number || "",
          birth_date: data.data.birth_date || "",
          activity_class: data.data.activity_class || "",
          hobby: data.data.hobby || "",
          address: data.data.address || "",
          gender: data.data.gender || "",
          status: data.data.status || ""
        });
      } else {
        throw new Error('Failed to fetch mentee');
      }
    } catch (error) {
      console.error('Error fetching mentee detail:', error);
      toast.error('Gagal memuat data mentee');
      navigate(`/mentor/kelompok/${id}`);
    } finally {
      setLoadingMentee(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMentee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mentees/${menteeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(mentee)
      });
      
      if (response.ok) {
        const toastId = toast.success('Data mentee berhasil diperbarui', { duration: 2000 });
        setTimeout(() => toast.dismiss(toastId), 2000);
        navigate(`/mentor/kelompok/${id}`);
      } else {
        throw new Error('Failed to update mentee');
      }
    } catch (error) {
      console.error('Error updating mentee:', error);
      const toastId = toast.error('Gagal memperbarui data mentee', { duration: 2000 });
      setTimeout(() => toast.dismiss(toastId), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loadingMentee) {
    return (
      <Layout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
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
            Edit Mentee
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Perbarui informasi mentee
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                <User size={16} className="text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Informasi Mentee
              </h3>
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Masukkan nama panggilan"
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
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kelas
                </label>
                <input
                  type="text"
                  name="activity_class"
                  value={mentee.activity_class}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Masukkan hobi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                <input
                  type="text"
                  value={mentee.gender}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={mentee.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alamat
                </label>
                <textarea
                  name="address"
                  value={mentee.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Masukkan alamat lengkap"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-4">
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
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              <Save size={16} className="mr-2" />
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditMentee;