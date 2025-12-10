import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Se os dados são FormData, remover o Content-Type para que o axios defina automaticamente
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    
    return config;
});

// Interceptor de resposta para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se for erro 401 (não autorizado) ou 422 (dados inválidos relacionados à autenticação)
        if (error.response?.status === 401 || 
            (error.response?.status === 422 && error.config?.url?.includes('/tipos'))) {
            // Limpar token inválido
            localStorage.removeItem('token');
            
            // Redirecionar para login apenas se não estivermos já na página de login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;