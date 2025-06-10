import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token - CORRIGIDO
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pet-finder-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

// Anúncios
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

// Comentários - CORRIGIDO: Tudo usando axios agora
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
    if (error.response) {
      // Erro do servidor com resposta
      throw new Error(error.response.data.error || 'Erro ao criar comentário');
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      // Outros erros
      throw new Error('Erro inesperado ao criar comentário');
    }
  }
};

export default api;