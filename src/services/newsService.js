import { api } from './api';

export const newsService = {
    // Получить все новости (с пагинацией)
    getAll: async (page = 0, size = 10) => {
        const response = await api.get(`/api/news?page=${page}&size=${size}`);
        return response.data;
    },

    // Получить новость по ID
    getById: async (id) => {
        const response = await api.get(`/api/news/${id}`);
        return response.data;
    },

    // Создать новость (с файлами)
create: async (title, content, files = []) => {
    // Если есть файлы — используем FormData
    if (files.length > 0) {
        const formData = new FormData();
        
        // ВАЖНО: Упаковываем JSON в Blob, чтобы указать тип данных
        const newsData = new Blob(
            [JSON.stringify({ title, content })], 
            { type: 'application/json' }
        );
        
        formData.append('news', newsData); 
        
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await api.post('/api/news', formData);
        return response.data;
    }
    
    // Если нет файлов — отправляем JSON (тут всё ок)
    const response = await api.post('/api/news', { title, content });
    return response.data;
},

    // Обновить новость
    update: async (id, title, content) => {
        const response = await api.put(`/api/news/${id}`, { title, content });
        return response.data;
    },

    // Удалить новость
    delete: async (id) => {
        await api.delete(`/api/news/${id}`);
    },
};