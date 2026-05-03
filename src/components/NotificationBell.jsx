import React, { useState, useEffect, useRef } from 'react';
import {
    IconButton, Badge, Popover, Box, Typography, List, ListItem,
    ListItemText, Button, Divider, CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { notificationService } from '../services/notificationService';
import { useWebSocket } from '../hooks/useWebSocket';

const NotificationBell = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef(null);
    
    const WEBSOCKET_URL = 'http://localhost:8080/ws/notifications';
    
    const handleWebSocketNotification = (notification) => {
        // Новое уведомление пришло через WebSocket
        setUnreadCount(prev => prev + 1);
        setNotifications(prev => [notification, ...prev]);
    };
    
    const { connected } = useWebSocket(WEBSOCKET_URL, null, handleWebSocketNotification);
    
    const loadNotifications = async (reset = false) => {
        if (loading) return;
        
        setLoading(true);
        try {
            const currentPage = reset ? 0 : page;
            const data = await notificationService.getMyNotifications(currentPage, 20);
            
            if (reset) {
                setNotifications(data.content);
                setPage(1);
                setHasMore(data.content.length === 20);
            } else {
                setNotifications(prev => [...prev, ...data.content]);
                setPage(currentPage + 1);
                setHasMore(data.content.length === 20);
            }
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const loadUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Ошибка загрузки счетчика:', error);
        }
    };
    
    useEffect(() => {
        if (anchorEl) {
            loadNotifications(true);
        }
    }, [anchorEl]);
    
    useEffect(() => {
        // Загружаем счетчик при монтировании
        loadUnreadCount();
        
        // Обновляем счетчик каждые 30 секунд
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);
    
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };
    
    const handleMarkAllRead = async () => {
        await notificationService.markAllAsRead();
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };
    
    const handleLoadMore = () => {
        if (hasMore && !loading && anchorEl) {
            loadNotifications(false);
        }
    };
    
    // Intersection Observer для бесконечной прокрутки
    useEffect(() => {
        if (!anchorEl) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    handleLoadMore();
                }
            },
            { threshold: 0.1 }
        );
        
        if (observerRef.current) {
            observer.observe(observerRef.current);
        }
        
        return () => observer.disconnect();
    }, [anchorEl, hasMore, loading]);
    
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'NEWS': return '📰';
            case 'TASK': return '📋';
            case 'CHAT': return '💬';
            default: return '🔔';
        }
    };
    
    const open = Boolean(anchorEl);
    
    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    {unreadCount > 0 ? <NotificationsActiveIcon /> : <NotificationsIcon />}
                </Badge>
            </IconButton>
            
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { width: 380, maxHeight: 500, overflow: 'hidden' } }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6">Уведомления</Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={handleMarkAllRead}>
                            Отметить все прочитанными
                        </Button>
                    )}
                </Box>
                
                <Box sx={{ overflow: 'auto', maxHeight: 400 }}>
                    {notifications.length === 0 && !loading && (
                        <Typography variant="body2" color="textSecondary" sx={{ p: 3, textAlign: 'center' }}>
                            Нет уведомлений
                        </Typography>
                    )}
                    
                    {notifications.map((notif, idx) => (
                        <React.Fragment key={notif.id}>
                            <ListItem
                                sx={{
                                    bgcolor: notif.isRead ? 'transparent' : 'action.hover',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'action.selected' }
                                }}
                                onClick={() => {
                                    if (notif.link) {
                                        window.location.href = notif.link;
                                    }
                                    handleClose();
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2">
                                                {getNotificationIcon(notif.type)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>
                                                {JSON.parse(notif.payload).title}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
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
                    
                    {(loading && notifications.length > 0) && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                    
                    <div ref={observerRef} style={{ height: 10 }} />
                </Box>
            </Popover>
        </>
    );
};

export default NotificationBell;