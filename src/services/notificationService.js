import { api } from './api';

export const notificationService = {
    // Получить уведомления пользователя
    getMyNotifications: async (page = 0, size = 20) => {
        const response = await api.get(`/api/notifications?page=${page}&size=${size}`);
        return response.data;
    },

    // Получить количество непрочитанных
    getUnreadCount: async () => {
        const response = await api.get('/api/notifications/unread/count');
        return response.data;
    },

    // Отметить все как прочитанные
    markAllAsRead: async () => {
        await api.post('/api/notifications/read-all');
    },
};