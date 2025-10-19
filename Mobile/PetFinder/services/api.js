import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Para funcionar no emulador mobile ou no Expo Go, usar o IP da máquina local
const API_BASE_URL = Platform.OS === 'android'
  ? 'http://192.168.1.xxx:3000/api' // <-- Substitua por seu IP local
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});


// Interceptor para adicionar token
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('pet-finder-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Erro ao obter token do AsyncStorage:", error);
  }
  return config;
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// --- Funções de API ---
// Auth
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

// Anúncios - Agora suporta FormData para Web
export const createAnnouncement = async (formData) => {
  // Se for uma instância de FormData, configuramos o header para multipart
  const headers = Platform.OS === 'web'
    ? { 'Content-Type': 'multipart/form-data' }
    : {};
  
  const response = await api.post('/announcements', formData, { headers });
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

// Localização
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

// Comentários
export const getComments = async (announcementId) => {
  try {
    const response = await api.get(`/announcements/${announcementId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    throw new Error('Erro ao carregar comentários');
  }
};

export const createComment = async (announcementId, content) => {
  try {
    const response = await api.post(`/announcements/${announcementId}/comments`, {
      content: content
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Erro ao criar comentário');
    } else {
        throw new Error('Erro inesperado ao criar comentário');
    }
  }
};

export default api;