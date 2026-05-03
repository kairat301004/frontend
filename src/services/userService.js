import { api } from './api';

export const userService = {
    getCurrentUser: async () => {
        const response = await api.get('/api/users/profile');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/api/users/profile', data);
        return response.data;
    },

    changePassword: async (oldPassword, newPassword) => {
        await api.post('/api/users/change-password', { oldPassword, newPassword });
    },

    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.post('/api/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getAllUsers: async () => {
        const response = await api.get('/api/users');
        return response.data;
    },

    searchUsers: async (query) => {
        const response = await api.get(`/api/users/search?q=${query}`);
        return response.data;
    },
};