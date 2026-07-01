import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/recent-activity'),
  getUpcomingInterviews: () => api.get('/dashboard/upcoming-interviews'),
  getFollowUpsDue: () => api.get('/dashboard/follow-ups-due'),
  getNotifications: () => api.get('/dashboard/notifications'),
  markAllRead: () => api.patch('/dashboard/notifications/read-all'),
};

// Applications
export const applicationsApi = {
  getAll: (params) => api.get('/applications', { params }),
  getKanban: () => api.get('/applications/kanban'),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
  delete: (id) => api.delete(`/applications/${id}`),
};

// Companies
export const companiesApi = {
  getAll: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
};

// Recruiters
export const recruitersApi = {
  getAll: (params) => api.get('/recruiters', { params }),
  getById: (id) => api.get(`/recruiters/${id}`),
  create: (data) => api.post('/recruiters', data),
  update: (id, data) => api.put(`/recruiters/${id}`, data),
  delete: (id) => api.delete(`/recruiters/${id}`),
  checkDuplicate: (email) => api.get('/recruiters/check-duplicate', { params: { email } }),
};

// Resumes
export const resumesApi = {
  getAll: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  upload: (formData) => api.post('/resumes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  rename: (id, name) => api.patch(`/resumes/${id}/rename`, { name }),
  setDefault: (id) => api.patch(`/resumes/${id}/set-default`),
  duplicate: (id) => api.post(`/resumes/${id}/duplicate`),
  delete: (id) => api.delete(`/resumes/${id}`),
  downloadUrl: (id) => `/api/resumes/${id}/download`,
};

// Email Templates
export const templatesApi = {
  getAll: (params) => api.get('/templates', { params }),
  getFavorites: () => api.get('/templates/favorites'),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  duplicate: (id) => api.post(`/templates/${id}/duplicate`),
  toggleFavorite: (id) => api.patch(`/templates/${id}/favorite`),
  delete: (id) => api.delete(`/templates/${id}`),
};

// AI
export const aiApi = {
  generateColdEmail: (data) => api.post('/ai/cold-email', data),
  generateCoverLetter: (data) => api.post('/ai/cover-letter', data),
  generateFollowUp: (data) => api.post('/ai/follow-up', data),
  generateInterviewQuestions: (data) => api.post('/ai/interview-questions', data),
  analyzeJob: (data) => api.post('/ai/analyze-job', data),
  resumeMatch: (data) => api.post('/ai/resume-match', data),
  rewriteEmail: (data) => api.post('/ai/rewrite-email', data),
  salaryNegotiation: (data) => api.post('/ai/salary-negotiation', data),
};

// Settings
export const settingsApi = {
  get: () => api.get('/settings'),
  updateProfile: (data) => api.put('/settings/profile', data),
  updateTheme: (theme) => api.put('/settings/theme', { theme }),
  updateAi: (data) => api.put('/settings/ai', data),
  changePassword: (data) => api.put('/settings/password', data),
};

// Import
export const importApi = {
  importJob: (data) => api.post('/import/job', data),
  generateEmail: (id, data) => api.post(`/import/job/${id}/generate-email`, data),
};
