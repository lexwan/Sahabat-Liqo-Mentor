import React, { useState, useEffect, useRef } from 'react';

const MentorSearchSelect = ({ value, onChange, placeholder = "Ketik nama mentor atau pilih dari daftar" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const searchMentors = async (search = '') => {
    setLoading(true);
    try {
      const api = (await import('../config/axios')).default;
      const response = await api.get('/groups/search-mentors', {
        params: { search, limit: 10 }
      });
      setMentors(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timeoutId = setTimeout(() => searchMentors(searchTerm), 300);
      return () => clearTimeout(timeoutId);
    } else if (searchTerm.length === 0) {
      searchMentors();
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMentor = (mentor) => {
    setSearchTerm(mentor.label);
    setIsOpen(false);
    onChange(mentor);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          if (mentors.length === 0) searchMentors();
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">Mencari...</div>
          ) : mentors.length > 0 ? (
            mentors.map((mentor) => (
              <div
                key={mentor.id}
                onClick={() => handleSelectMentor(mentor)}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0 dark:border-gray-600"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium dark:text-white">{mentor.full_name || mentor.email}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{mentor.email}</div>
                  </div>
                  {mentor.gender && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      mentor.gender === 'Ikhwan' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
                    }`}>
                      {mentor.gender}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Mentor tidak ditemukan' : 'Tidak ada mentor tersedia'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorSearchSelect;