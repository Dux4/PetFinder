import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pet-finder-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/auth/profile', userData);
  return response.data;
};

export const createAnnouncement = async (formData) => {
  const response = await api.post('/announcements', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAllAnnouncements = async (status = 'ativo') => {
  const response = await api.get('/announcements', {
    params: { status }
  });
  return response.data;
};

export const getAnnouncementById = async (id) => {
  const response = await api.get(`/announcements/${id}`);
  return response.data;
};

export const getMyAnnouncements = async (status) => {
  const response = await api.get('/my-announcements', {
    params: status ? { status } : {}
  });
  return response.data;
};

export const updateAnnouncementStatus = async (id, status) => {
  const response = await api.patch(`/announcements/${id}/status`, { status });
  return response.data;
};

export const getNeighborhoods = async () => {
  const response = await api.get('/neighborhoods');
  return response.data;
};

export const getLocationFromCoords = async (latitude, longitude) => {
  const response = await api.post('/get-location', { latitude, longitude });
  return response.data;
};

export const getNeighborhoodCoords = async (neighborhood) => {
  const response = await api.get('/neighborhood-coords', {
    params: { neighborhood }
  });
  return response.data;
};

export const getComments = async (announcementId) => {
  const response = await api.get(`/announcements/${announcementId}/comments`);
  return response.data;
};

export const createComment = async (announcementId, content) => {
  const response = await api.post(`/announcements/${announcementId}/comments`, {
    content: content
  });
  return response.data;
};

export default api;