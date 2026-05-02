import { api } from './api';

export const chatService = {
    // Получить все чаты пользователя
    getMyChats: async (page = 0, size = 20) => {
        const response = await api.get(`/api/chats?page=${page}&size=${size}`);
        return response.data;
    },

    // Получить чат по ID
    getChatById: async (chatId) => {
        const response = await api.get(`/api/chats/${chatId}`);
        return response.data;
    },

    // Получить сообщения чата
    getMessages: async (chatId, page = 0, size = 50) => {
        const response = await api.get(`/api/chats/${chatId}/messages?page=${page}&size=${size}`);
        return response.data;
    },

    // Создать приватный чат
    createPrivateChat: async (userId) => {
        const response = await api.post(`/api/chats/private/${userId}`);
        return response.data;
    },

    // Создать групповой чат
    createGroupChat: async (name, participantIds) => {
        const response = await api.post('/api/chats/group', { name, participantIds });
        return response.data;
    },

    // Отправить сообщение
    sendMessage: async (chatId, content) => {
        const response = await api.post('/api/chats/messages', { chatId, content });
        return response.data;
    },

    // Добавить участников в групповой чат
    addParticipants: async (chatId, participantIds) => {
        const response = await api.post(`/api/chats/${chatId}/participants`, { participantIds });
        return response.data;
    },

    // Выйти из чата
    leaveChat: async (chatId) => {
        await api.delete(`/api/chats/${chatId}/leave`);
    },
};