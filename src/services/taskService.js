import { api } from './api';

export const taskService = {
    // Получить все задачи (с пагинацией)
    getAll: async (page = 0, size = 10) => {
        const response = await api.get(`/api/tasks?page=${page}&size=${size}`);
        return response.data;
    },

    // Получить мои задачи (где я создатель или исполнитель)
    getMyTasks: async (page = 0, size = 10) => {
        const response = await api.get(`/api/tasks/my?page=${page}&size=${size}`);
        return response.data;
    },

    // Получить задачу по ID
    getById: async (id) => {
        const response = await api.get(`/api/tasks/${id}`);
        return response.data;
    },

    // Создать задачу (с поддержкой файлов)
    create: async (taskData, files = []) => {
        // Если есть файлы — используем FormData
        if (files && files.length > 0) {
            const formData = new FormData();
            
            // Упаковываем JSON в Blob
            const taskBlob = new Blob([JSON.stringify(taskData)], { type: 'application/json' });
            formData.append('task', taskBlob);
            
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await api.post('/api/tasks', formData);
            return response.data;
        }
        
        // Если нет файлов — отправляем JSON
        const response = await api.post('/api/tasks', taskData);
        return response.data;
    },

    // Обновить задачу
    update: async (id, taskData) => {
        const response = await api.put(`/api/tasks/${id}`, taskData);
        return response.data;
    },

    // Обновить только статус
    updateStatus: async (id, status) => {
        const response = await api.patch(`/api/tasks/${id}/status?status=${status}`);
        return response.data;
    },

    // Удалить задачу
    delete: async (id) => {
        await api.delete(`/api/tasks/${id}`);
    },
};