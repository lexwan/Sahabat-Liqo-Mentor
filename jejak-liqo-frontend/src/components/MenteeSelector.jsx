import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MenteeSelector = ({ mentorGender, selectedMentees, onChange }) => {
  const { isDark } = useTheme();
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mentorGender) {
      fetchMentees();
    }
  }, [mentorGender]);

  const fetchMentees = async () => {
    setLoading(true);
    try {
      const api = (await import('../config/axios')).default;
      const response = await api.get(`/groups/mentees-by-gender?gender=${mentorGender}`);
      setMentees(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      setMentees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenteeToggle = (mentee) => {
    const isSelected = selectedMentees.some(m => m.id === mentee.id);
    
    if (isSelected) {
      onChange(selectedMentees.filter(m => m.id !== mentee.id));
    } else {
      onChange([...selectedMentees, mentee]);
    }
  };

  if (!mentorGender) {
    return <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>Pilih mentor terlebih dahulu</div>;
  }

  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        Pilih Mentee ({mentorGender})
      </label>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Memuat mentees...
          </p>
        </div>
      ) : (
        <div className={`max-h-60 overflow-y-auto border rounded-md ${
          isDark ? 'border-gray-600' : 'border-gray-300'
        }`}>
          {mentees.map((mentee) => {
            const isSelected = selectedMentees.some(m => m.id === mentee.id);
            
            return (
              <div
                key={mentee.id}
                onClick={() => handleMenteeToggle(mentee)}
                className={`p-3 border-b cursor-pointer transition-colors ${
                  isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                } ${
                  isSelected ? (isDark ? 'bg-blue-900/30' : 'bg-blue-50') : ''
                } last:border-b-0`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {mentee.full_name}
                      </div>
                      {mentee.nickname && (
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({mentee.nickname})
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {mentee.is_available ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs">
                        Tersedia
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs">
                        Sudah dalam kelompok
                      </span>
                    )}
                  </div>
                </div>
                
                {!mentee.is_available && mentee.group_name && (
                  <div className={`mt-1 text-xs ml-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Kelompok: {mentee.group_name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {selectedMentees.length > 0 && (
        <div className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {selectedMentees.length} mentee dipilih
        </div>
      )}
    </div>
  );
};

export default MenteeSelector;