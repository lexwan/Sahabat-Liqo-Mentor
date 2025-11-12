import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MoveConfirmationModal = ({ isOpen, onClose, onConfirm, menteesToMove, targetGroup }) => {
  const { isDark } = useTheme();
  
  if (!isOpen) return null;

  const menteesByGroup = menteesToMove.reduce((acc, mentee) => {
    if (!mentee.is_available) {
      const groupName = mentee.group_name || 'Kelompok Tidak Diketahui';
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(mentee);
    }
    return acc;
  }, {});

  const hasGroupedMentees = Object.keys(menteesByGroup).length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-xl max-w-md w-full mx-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Konfirmasi Pemindahan
          </h3>
          
          {hasGroupedMentees ? (
            <div className="mb-4">
              <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Apakah yakin untuk memindahkan mentee berikut ke <strong>{targetGroup}</strong>?
              </p>
              
              {Object.entries(menteesByGroup).map(([groupName, mentees]) => (
                <div key={groupName} className={`mb-3 p-3 rounded ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className={`font-medium text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Dari {groupName} ({mentees.length} mentee):
                  </div>
                  <div className="space-y-1">
                    {mentees.map(mentee => (
                      <div key={mentee.id} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        • {mentee.full_name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Memindahkan {menteesToMove.length} mentee ke <strong>{targetGroup}</strong>
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
              Tidak
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Ya, Pindahkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoveConfirmationModal;