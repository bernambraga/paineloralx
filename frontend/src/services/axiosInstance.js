import axios from 'axios';

// Função para retornar dinamicamente a base URL
const getBaseUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost') {
    return 'http://localhost:8000/api';
  } else if (hostname === 'dev.paineloralx.com.br') {
    return 'https://dev.paineloralx.com.br/api';
  } else {
    return 'https://paineloralx.com.br/api';
  }
};

// Criação do instance
const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Mantém cookies (CSRF)
});

// Interceptor de request: injeta o token automaticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response: tenta refresh se 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${getBaseUrl()}/token/refresh/`, { refresh: refreshToken });
        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        
        // Atualiza Authorization e reenvia a requisição
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Falha ao renovar token', refreshError);
        // Opcional: pode fazer logout automático aqui se quiser
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
