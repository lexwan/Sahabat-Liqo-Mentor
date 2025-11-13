import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const EditGroupModal = ({ isOpen, onClose, group, onUpdate, field }) => {
  const [formData, setFormData] = useState({
    group_name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (group && isOpen) {
      setFormData({
        group_name: group.group_name || '',
        description: group.description || ''
      });
    }
  }, [group, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    toast((t) => (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-3">
          <span className="font-medium text-gray-900 dark:text-white">
            Apakah Anda yakin ingin menyimpan hasil editan?
          </span>
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                confirmSave();
              }}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
            >
              Ya, Simpan
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
      style: {
        background: 'transparent',
        boxShadow: 'none'
      }
    });
  };

  const confirmSave = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mentor/groups/${group.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedGroup = await response.json();
        onUpdate(updatedGroup.data);
        const toastId = toast.success('Kelompok berhasil diperbarui', { duration: 2000 });
        setTimeout(() => toast.dismiss(toastId), 2000);
        onClose();
      } else {
        throw new Error('Failed to update group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      const toastId = toast.error('Gagal memperbarui kelompok', { duration: 2000 });
      setTimeout(() => toast.dismiss(toastId), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (field) {
      case 'name': return 'Edit Nama Kelompok';
      case 'description': return 'Edit Deskripsi';
      default: return 'Edit Kelompok';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getModalTitle()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {(!field || field === 'name') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Kelompok
                </label>
                <input
                  type="text"
                  value={formData.group_name}
                  onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            )}

            {(!field || field === 'description') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;