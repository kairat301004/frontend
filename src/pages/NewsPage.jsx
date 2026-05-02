import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Button, Pagination, Box, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NewsCard from '../components/NewsCard';
import NewsForm from '../components/NewsForm';
import { newsService } from '../services/newsService';

const NewsPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState(null);

    useEffect(() => {
        loadNews();
    }, [page]);

    const loadNews = async () => {
        setLoading(true);
        try {
            const data = await newsService.getAll(page, 10);
            setNews(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Ошибка загрузки новостей');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (title, content, files) => {
        await newsService.create(title, content, files);
        await loadNews();
    };

    const handleUpdate = async (title, content) => {
        if (editingNews) {
            await newsService.update(editingNews.id, title, content);
            setEditingNews(null);
            await loadNews();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить новость?')) {
            await newsService.delete(id);
            await loadNews();
        }
    };

    const handleEdit = (newsItem) => {
        setEditingNews(newsItem);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingNews(null);
    };

    if (loading && news.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Новости</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
                    Новая новость
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {news.map((item) => (
                <NewsCard
                    key={item.id}
                    news={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ))}

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page + 1}
                        onChange={(e, value) => setPage(value - 1)}
                        color="primary"
                    />
                </Box>
            )}

            <NewsForm
                open={modalOpen}
                onClose={handleModalClose}
                onSubmit={editingNews ? handleUpdate : handleCreate}
                initialData={editingNews}
            />
        </Container>
    );
};

export default NewsPage;