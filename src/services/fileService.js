import { api } from './api';

export const fileService = {
    // Получить все файлы (с пагинацией)
    getAll: async (page = 0, size = 20) => {
        const response = await api.get(`/api/files?page=${page}&size=${size}`);
        return response.data;
    },

    // Получить файлы пользователя
    getByUser: async (userId, page = 0, size = 20) => {
        const response = await api.get(`/api/files/user/${userId}?page=${page}&size=${size}`);
        return response.data;
    },

    // Получить информацию о файле
    getInfo: async (fileId) => {
        const response = await api.get(`/api/files/${fileId}`);
        return response.data;
    },

    // Скачать файл (возвращает Blob)
    download: async (fileId, fileName) => {
        const response = await api.get(`/api/files/download/${fileId}`, {
            responseType: 'blob'
        });
        
        // Создать ссылку для скачивания
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    // Удалить файл
    delete: async (fileId) => {
        await api.delete(`/api/files/${fileId}`);
    },
};