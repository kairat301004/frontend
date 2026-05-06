import { api } from './api';

export const adminService = {
    // ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ==========
    
    // Получить всех пользователей (с пагинацией и поиском)
    getAllUsers: async (page = 0, size = 20, search = '') => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', size);
        if (search) params.append('search', search);
        
        const response = await api.get(`/api/admin/users?${params.toString()}`);
        return response.data;
    },

    // Получить пользователя по ID
    getUserById: async (id) => {
        const response = await api.get(`/api/admin/users/${id}`);
        return response.data;
    },

    // Создать пользователя
    createUser: async (userData) => {
        const response = await api.post('/api/admin/users', userData);
        return response.data;
    },

    // Обновить пользователя
    updateUser: async (id, userData) => {
        const response = await api.put(`/api/admin/users/${id}`, userData);
        return response.data;
    },

    // Удалить пользователя
    deleteUser: async (id) => {
        await api.delete(`/api/admin/users/${id}`);
    },

    // Сбросить пароль
    resetPassword: async (id, newPassword) => {
        await api.post(`/api/admin/users/${id}/reset-password?newPassword=${newPassword}`);
    },

    // ========== УПРАВЛЕНИЕ РОЛЯМИ ==========
    
    getAllRoles: async () => {
        const response = await api.get('/api/admin/roles');
        return response.data;
    },

    // ========== УПРАВЛЕНИЕ ДЕПАРТАМЕНТАМИ ==========
    
    getAllDepartments: async () => {
        const response = await api.get('/api/admin/departments');
        return response.data;
    },

    createDepartment: async (name, description) => {
        const response = await api.post(`/api/admin/departments?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`);
        return response.data;
    },
};