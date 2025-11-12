import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, message = 'Login berhasil!' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-6 max-w-sm mx-4 shadow-2xl border border-gray-200 dark:border-[#4DABFF]/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Berhasil!
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>

        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-[#4DABFF] hover:bg-[#3a8fd9] text-white font-medium rounded-lg transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
