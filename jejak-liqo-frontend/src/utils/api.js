import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const meetingAPI = {

  getList: (params = {}) => api.get('/meetings', { params }),
  getDetail: (id) => api.get(`/meetings/${id}`),
  create: (data) => api.post('/meetings', data),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  delete: (id) => api.delete(`/meetings/${id}`),
  

  getStats: (params = {}) => api.get('/meetings/stats', { params }),
  getFormOptions: () => api.get('/meetings/form-options'),
  getTrashed: (params = {}) => api.get('/meetings/trashed', { params }),
  restore: (id) => api.post(`/meetings/restore/${id}`),
  forceDelete: (id) => api.delete(`/meetings/force-delete/${id}`),
  

  getAttendanceReport: (params = {}) => api.get('/meetings/attendance-report', { params }),
  

  exportPDF: (params = {}) => api.get('/meetings/export/pdf', { params, responseType: 'blob' }),
  exportExcel: (params = {}) => api.get('/meetings/export/excel', { params, responseType: 'blob' }),
  

  getMeetings: (params = {}) => api.get('/meetings', { params }),
  createMeeting: (data) => api.post('/meetings', data),
  updateMeeting: (id, data) => api.put(`/meetings/${id}`, data),
  deleteMeeting: (id) => api.delete(`/meetings/${id}`),
  getMeeting: (id) => api.get(`/meetings/${id}`)
};


export const menteeAPI = {
  getList: (params = {}) => api.get('/mentees', { params }),
  getDetail: (id) => api.get(`/mentees/${id}`),
  getEditData: (id) => api.get(`/mentees/${id}/edit`),
  create: (data) => {

    if (!data.full_name || !data.gender) {
      return Promise.reject(new Error('Required fields missing: full_name, gender'));
    }
    return api.post('/mentees', data);
  },
  update: (id, data) => api.put(`/mentees/${id}`, data),
  delete: (id) => api.delete(`/mentees/${id}`),
  getStats: () => api.get('/mentees/stats'),
  getFormOptions: () => api.get('/mentees/form-options'),
  getTrashed: (params = {}) => api.get('/mentees/trashed', { params }),
  restore: (id) => api.post(`/mentees/restore/${id}`),
  forceDelete: (id) => api.delete(`/mentees/force-delete/${id}`)
};


export const mentorAPI = {
  getList: (params = {}) => api.get('/mentors', { params }),
  getDetail: (id) => api.get(`/mentors/${id}`),
  getEditData: (id) => api.get(`/mentors/${id}/edit`),
  create: (data) => {
    if (!data.full_name || !data.email || !data.gender) {
      return Promise.reject(new Error('Required fields missing: full_name, email, gender'));
    }
    return api.post('/mentors', data);
  },
  update: (id, data) => api.put(`/mentors/${id}`, data),
  delete: (id) => api.delete(`/mentors/${id}`),
  getStats: () => api.get('/mentors/stats'),
  getFormOptions: () => api.get('/mentors/form-options'),
  getTrashed: (params = {}) => api.get('/mentors/trashed', { params }),
  restore: (id) => api.post(`/mentors/restore/${id}`),
  forceDelete: (id) => api.delete(`/mentors/force-delete/${id}`),
  block: (id) => api.post(`/mentors/${id}/block`),
  unblock: (id) => api.post(`/mentors/${id}/unblock`)
};


export const groupAPI = {
  getList: (params = {}) => api.get('/groups', { params }),
  getDetail: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  getTrashed: (params = {}) => api.get('/groups/trashed', { params }),
  restore: (id) => api.post(`/groups/restore/${id}`),
  forceDelete: (id) => api.delete(`/groups/force-delete/${id}`),
  getFormOptions: () => api.get('/groups/form-options'),
  getMenteesByGender: (gender, search = '') => api.get('/groups/mentees-by-gender', { 
    params: { gender, search } 
  }),
  getDeleteInfo: (id) => api.get(`/groups/${id}/delete-info`)
};


export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export default api;