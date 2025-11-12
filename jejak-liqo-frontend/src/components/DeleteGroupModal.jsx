import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const DeleteGroupModal = ({ groupId, isOpen, onClose, onConfirm, groupName }) => {
  const { isDark } = useTheme();
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen && groupId) {
      fetchDeleteInfo();
    }
  }, [isOpen, groupId]);
  
  const fetchDeleteInfo = async () => {
    setLoading(true);
    try {
      const { groupAPI } = await import('../utils/api');
      const response = await groupAPI.getDeleteInfo(groupId);
      setDeleteInfo(response.data.data || response.data);
    } catch (error) {
      console.error('Error:', error);
      setDeleteInfo(null);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-xl max-w-md w-full mx-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Hapus Kelompok
          </h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Memuat info kelompok...
              </p>
            </div>
          ) : deleteInfo ? (
            <div className="mb-4">
              <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Yakin hapus kelompok <strong>{deleteInfo.group_name}</strong>?
              </p>
              
              {deleteInfo.mentees_count > 0 && (
                <div className={`p-3 rounded mt-3 ${
                  isDark ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <p className={`font-medium ${
                    isDark ? 'text-yellow-400' : 'text-yellow-800'
                  }`}>
                    <strong>{deleteInfo.mentees_count} mentee</strong> akan menjadi tersedia kembali:
                  </p>
                  <ul className={`mt-2 text-sm space-y-1 ${
                    isDark ? 'text-yellow-300' : 'text-yellow-700'
                  }`}>
                    {deleteInfo.mentees.map(mentee => (
                      <li key={mentee.id}>• {mentee.display_name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Yakin hapus kelompok <strong>{groupName}</strong>?
            </p>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteGroupModal;