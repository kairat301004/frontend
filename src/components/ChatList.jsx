import React, { useState, useEffect } from 'react';
import {
    Box, List, ListItem, ListItemButton, ListItemText, ListItemAvatar,
    Avatar, Typography, IconButton, Drawer, TextField, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip, CircularProgress,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { chatService } from '../services/chatService';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatList = ({ onSelectChat, selectedChatId }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openGroupDialog, setOpenGroupDialog] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [creating, setCreating] = useState(false);
    const { user } = useAuth(); // добавить

    useEffect(() => {
        loadChats();
        loadUsers();
    }, []);

    const loadChats = async () => {
        setLoading(true);
        try {
            const data = await chatService.getMyChats(0, 50);
            setChats(data.content);
        } catch (err) {
            setError('Ошибка загрузки чатов');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await api.get('/api/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Ошибка загрузки пользователей:', err);
        }
    };

    const handleCreatePrivateChat = async (userId) => {
        setCreating(true);
        try {
            await chatService.createPrivateChat(userId);
            await loadChats();
            setOpenCreateDialog(false);
        } catch (err) {
            console.error('Ошибка создания чата:', err);
        } finally {
            setCreating(false);
        }
    };

    const handleCreateGroupChat = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) {
            return;
        }
        setCreating(true);
        try {
            await chatService.createGroupChat(groupName, selectedUsers);
            await loadChats();
            setOpenGroupDialog(false);
            setGroupName('');
            setSelectedUsers([]);
        } catch (err) {
            console.error('Ошибка создания группы:', err);
        } finally {
            setCreating(false);
        }
    };

    const toggleUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const getChatName = (chat) => {
        if (chat.type === 'GROUP') return chat.name;
        // Для приватного чата — имя собеседника
        const otherUser = chat.participants?.find(p => p.id !== user?.id);
        return otherUser?.fullName || 'Приватный чат';
    };

    const getChatAvatar = (chat) => {
        if (chat.type === 'GROUP') return '👥';
        return '👤';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Кнопки создания чатов */}
            <Box sx={{ p: 2, display: 'flex', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreateDialog(true)}
                >
                    Приватный
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GroupAddIcon />}
                    onClick={() => setOpenGroupDialog(true)}
                >
                    Группа
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

            <List sx={{ flex: 1, overflow: 'auto' }}>
                {chats.length === 0 && !error && (
                    <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
                        Нет чатов. Начните диалог!
                    </Typography>
                )}
                {chats.map((chat) => (
                    <ListItem key={chat.id} disablePadding>
                        <ListItemButton
                            selected={selectedChatId === chat.id}
                            onClick={() => onSelectChat(chat.id)}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: chat.type === 'GROUP' ? '#1976d2' : '#4caf50' }}>
                                    {getChatAvatar(chat)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={getChatName(chat)}
                                secondary={chat.lastMessage || 'Нет сообщений'}
                                secondaryTypographyProps={{
                                    noWrap: true,
                                    style: { maxWidth: '150px' }
                                }}
                            />
                            {chat.unreadCount > 0 && (
                                <Chip label={chat.unreadCount} size="small" color="error" />
                            )}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* Диалог создания приватного чата */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Выберите пользователя</DialogTitle>
                <DialogContent>
                    <List>
                        {users.map(user => (
                            <ListItem key={user.id} disablePadding>
                                <ListItemButton onClick={() => handleCreatePrivateChat(user.id)} disabled={creating}>
                                    <ListItemAvatar>
                                        <Avatar>{user.firstName?.[0]}{user.lastName?.[0]}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={`${user.firstName} ${user.lastName}`} secondary={user.email} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>

            {/* Диалог создания группового чата */}
            <Dialog open={openGroupDialog} onClose={() => setOpenGroupDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Создать групповой чат</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Название группы"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        margin="normal"
                        required
                    />
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Участники:</Typography>
                    <List dense>
                        {users.map(user => (
                            <ListItem key={user.id} disablePadding>
                                <ListItemButton onClick={() => toggleUser(user.id)}>
                                    <ListItemAvatar>
                                        <Avatar>{user.firstName?.[0]}{user.lastName?.[0]}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={`${user.firstName} ${user.lastName}`} secondary={user.email} />
                                    {selectedUsers.includes(user.id) && <Chip label="Выбран" size="small" color="primary" />}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenGroupDialog(false)}>Отмена</Button>
                    <Button
                        onClick={handleCreateGroupChat}
                        variant="contained"
                        disabled={!groupName.trim() || selectedUsers.length === 0 || creating}
                    >
                        {creating ? 'Создание...' : 'Создать'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChatList;