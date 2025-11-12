import api from './axiosInstance';

export const getAllMentees = async () => {
  const response = await api.get('/mentees');
  return response.data;
};

