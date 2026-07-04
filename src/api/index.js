import axios from 'axios';

const api = axios.create({ baseURL: (process.env.REACT_APP_API_URL || '') + '/api' });

api.interceptors.request.use(c => {
  const token = localStorage.getItem('token');
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
});

api.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(e);
});

export const resumesApi = {
  list: () => api.get('/resumes'),
  upload: (fd) => api.post('/resumes', fd),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  setDefault: (id) => api.post(`/resumes/${id}/set-default`),
  download: (id) => api.get(`/resumes/${id}/download`, { responseType: 'blob' }),
  duplicate: (id) => api.post(`/resumes/${id}/duplicate`),
  delete: (id) => api.delete(`/resumes/${id}`),
};

export const templatesApi = {
  list: (params) => api.get('/templates', { params }),
  favorites: () => api.get('/templates/favorites'),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  toggleFavorite: (id) => api.post(`/templates/${id}/toggle-favorite`),
  duplicate: (id) => api.post(`/templates/${id}/duplicate`),
  delete: (id) => api.delete(`/templates/${id}`),
};

export const campaignApi = {
  send: (data) => api.post('/campaigns/send', data),
  schedule: (data) => api.post('/campaigns/schedule', data),
  listScheduled: () => api.get('/campaigns/scheduled'),
  updateScheduled: (id, data) => api.put(`/campaigns/scheduled/${id}`, data),
  deleteScheduled: (id) => api.delete(`/campaigns/scheduled/${id}`),
  sentHistory: (params) => api.get('/campaigns/sent', { params }),
  deleteSent: (id) => api.delete(`/campaigns/sent/${id}`),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  changePassword: (data) => api.post('/settings/change-password', data),
};

export const gmailApi = {
  authUrl: () => api.get('/gmail/auth-url'),
  disconnect: () => api.post('/gmail/disconnect'),
  status: () => api.get('/gmail/status'),
};

export default api;
