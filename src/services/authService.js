import { api } from './api';

export const authService = {
    // Логин
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // Логаут
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    // Проверка текущего пользователя (кто я)
    getCurrentUser: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            return null;
        }
    },
};