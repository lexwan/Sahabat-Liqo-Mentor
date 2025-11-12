import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../../../components/mentor/Layout";
import { createMentorGroup } from "../../../api/mentor";
import { ArrowLeft, Save } from "lucide-react";

const TambahKelompok = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    group_name: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.group_name.trim()) {
      toast.error('Nama kelompok harus diisi');
      return;
    }

    try {
      setLoading(true);
      const response = await createMentorGroup({
        group_name: formData.group_name,
        description: formData.description
      });
      
      toast.success('Kelompok berhasil dibuat');
      navigate('/mentor/dashboard');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat kelompok');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/mentor/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Dashboard
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Buat Kelompok Baru
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Isi informasi kelompok mentoring yang akan dibuat.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="group_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Kelompok *
              </label>
              <input
                type="text"
                id="group_name"
                name="group_name"
                value={formData.group_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Contoh: Kelompok Al-Fatihah"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Deskripsi singkat tentang kelompok ini..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/mentor/dashboard')}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={16} className="mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Kelompok'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default TambahKelompok;