import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/admin/Layout';
import MentorSearchSelect from '../../../components/MentorSearchSelect';
import MenteeSelector from '../../../components/MenteeSelector';
import MoveConfirmationModal from '../../../components/MoveConfirmationModal';

import { ArrowLeft, Search, Users, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { groupAPI } from '../../../utils/api';

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const TambahKelompok = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [showMoveConfirmation, setShowMoveConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    mentor_id: null
  });





  const handleMentorChange = (mentor) => {
    console.log('Selected mentor:', mentor);
    setSelectedMentor(mentor);
    setSelectedMentees([]); // Reset mentees
    setFormData(prev => ({ 
      ...prev, 
      mentor_id: mentor ? mentor.id : null
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.group_name || !formData.mentor_id) {
      toast.error('Nama kelompok dan mentor wajib diisi');
      return;
    }

    // Check if any selected mentees are already in groups
    const menteesInGroups = selectedMentees.filter(m => !m.is_available);
    
    if (menteesInGroups.length > 0) {
      setShowMoveConfirmation(true);
      return;
    }
    
    // Proceed with normal creation
    await createGroupWithMentees();
  };

  const createGroupWithMentees = async () => {
    setLoading(true);
    try {
      // Create group with selected mentees (backend should handle moving mentees)
      const submitData = {
        ...formData,
        mentee_ids: selectedMentees.map(m => m.id)
      };
      
      const response = await groupAPI.create(submitData);
      toast.success('Kelompok berhasil ditambahkan!');
      navigate('/admin/kelola-kelompok');
    } catch (error) {
      console.error('Error creating group:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menambahkan kelompok';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout activeMenu="Kelola Kelompok">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/admin/kelola-kelompok')}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="ml-4">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Tambah Kelompok
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Buat kelompok baru dengan mentor dan mentees
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Kelompok */}
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Informasi Kelompok
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nama Kelompok *
                    </label>
                    <input
                      type="text"
                      value={formData.group_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, group_name: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="Masukkan nama kelompok"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="Deskripsi kelompok (opsional)"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Mentor *
                    </label>
                    <MentorSearchSelect
                      value={selectedMentor}
                      onChange={handleMentorChange}
                    />
                    
                    {selectedMentor && (
                      <div className={`mt-2 p-2 rounded border text-sm ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <strong className={isDark ? 'text-white' : 'text-gray-900'}>Terpilih:</strong> {selectedMentor.full_name}
                        {selectedMentor.gender && (
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            selectedMentor.gender === 'Ikhwan' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                              : 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
                          }`}>
                            {selectedMentor.gender}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pilih Mentees */}
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <Users size={20} className="inline mr-2" />
                  Pilih Mentees
                </h3>

                <MenteeSelector
                  mentorGender={selectedMentor?.gender}
                  selectedMentees={selectedMentees}
                  onChange={setSelectedMentees}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/admin/kelola-kelompok')}
                className={`px-6 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : 'Simpan Kelompok'}
              </button>
            </div>
          </form>


        </div>

        {/* Move Confirmation Modal */}
        <MoveConfirmationModal
          isOpen={showMoveConfirmation}
          onClose={() => setShowMoveConfirmation(false)}
          onConfirm={() => {
            setShowMoveConfirmation(false);
            createGroupWithMentees();
          }}
          menteesToMove={selectedMentees.filter(m => !m.is_available)}
          targetGroup={formData.group_name}
        />
      </div>
    </Layout>
  );
};

export default TambahKelompok;