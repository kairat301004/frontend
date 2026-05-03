import React, { useState, useEffect } from 'react';
import {
    Container, Typography, List, ListItem, ListItemText,
    Box, Button, Pagination, CircularProgress, Alert, Divider
} from '@mui/material';
import { notificationService } from '../services/notificationService';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadNotifications();
    }, [page]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getMyNotifications(page, 20);
            setNotifications(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Ошибка загрузки уведомлений');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        await notificationService.markAllAsRead();
        await loadNotifications();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'NEWS': return '📰';
            case 'TASK': return '📋';
            case 'CHAT': return '💬';
            default: return '🔔';
        }
    };

    if (loading && notifications.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Уведомления</Typography>
                <Button variant="outlined" onClick={handleMarkAllRead}>
                    Отметить все прочитанными
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {notifications.length === 0 && !error && (
                <Alert severity="info">
                    Нет уведомлений
                </Alert>
            )}

            <List>
                {notifications.map((notif, idx) => (
                    <React.Fragment key={notif.id}>
                        <ListItem
                            sx={{
                                bgcolor: notif.isRead ? 'transparent' : '#f0f7ff',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#e3f2fd' }
                            }}
                            onClick={() => {
                                const payload = JSON.parse(notif.payload);
                                if (payload.link) {
                                    window.location.href = payload.link;
                                }
                            }}
                        >
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1">
                                            {getNotificationIcon(notif.type)}
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>
                                            {JSON.parse(notif.payload).title}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <>
                                        <Typography variant="body2" color="textSecondary">
                                            {JSON.parse(notif.payload).content}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                        {idx < notifications.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>

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
        </Container>
    );
};

export default NotificationsPage;