import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const createAnnouncement = async (formData) => {
  const response = await api.post('/announcements', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAllAnnouncements = async () => {
  const response = await api.get('/announcements');
  return response.data;
};

export const getNearbyAnnouncements = async (latitude, longitude, radius = 10) => {
  const response = await api.get('/announcements/nearby', {
    params: { latitude, longitude, radius }
  });
  return response.data;
};

export default api;