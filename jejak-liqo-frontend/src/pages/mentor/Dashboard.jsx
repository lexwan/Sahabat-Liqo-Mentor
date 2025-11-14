import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../../components/mentor/Layout";
import { getMentorGroups } from "../../api/mentor";
import { User, Calendar } from "lucide-react";

const MentorDashboard = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorGroups();
  }, []);

  const fetchMentorGroups = async () => {
    try {
      setLoading(true);
      const response = await getMentorGroups();
      setGroups(response.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Gagal memuat data kelompok');
      // Fallback to mock data if API fails
      const mockGroups = [
        {
          id: 1,
          group_name: "Kelompok Al-Fatihah",
          description: "Kelompok mentoring untuk pemula",
          mentor: {
            profile: {
              full_name: "Ahmad Rizki",
              profile_picture: null
            }
          },
          created_at: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          group_name: "Kelompok Al-Baqarah",
          description: "Kelompok mentoring lanjutan",
          mentor: {
            profile: {
              full_name: "Siti Fatimah",
              profile_picture: null
            }
          },
          created_at: "2024-02-20T14:15:00Z"
        }
      ];
      setGroups(mockGroups);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (groupId) => {
    navigate(`/mentor/kelompok/${groupId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Daftar Kelompok
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola dan pantau aktivitas kelompok mentoring Anda.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleGroupClick(group.id)}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {group.group_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                      {group.mentor?.profile?.full_name || 'Mentor'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {group.mentor?.profile?.profile_picture ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/storage/${group.mentor.profile.profile_picture}`}
                        alt={group.mentor.profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-white" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Calendar size={16} className="mr-2" />
                  <span>Dibuat {formatDate(group.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Belum Ada Kelompok
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Anda belum memiliki kelompok mentoring.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MentorDashboard;