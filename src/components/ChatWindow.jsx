import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Box, Paper, TextField, IconButton, Typography, Avatar, 
    CircularProgress, Chip, Menu, MenuItem, List, ListItem, ListItemText
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import { chatService } from '../services/chatService';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';

const ChatWindow = ({ chatId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [chat, setChat] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    
    const WEBSOCKET_URL = 'http://localhost:8080/ws/chat';
    
    const handleWebSocketMessage = useCallback((message) => {
        console.log('Новое сообщение через WebSocket:', message);
        if (message.chatId === chatId) {
            setMessages(prev => [...prev, message]);
            markAsRead();
        }
    }, [chatId]);
    
    const { connected, sendMessage, subscribeToChat } = useWebSocket(
        WEBSOCKET_URL,
        handleWebSocketMessage,
        null
    );
    
    useEffect(() => {
        if (connected && chatId) {
            subscribeToChat(chatId);
            markAsRead();
        }
    }, [connected, chatId, subscribeToChat]);
    
    useEffect(() => {
        if (chatId) {
            loadChat();
            loadMessages();
        }
    }, [chatId]);
    
    const markAsRead = async () => {
        try {
            await api.post(`/api/chats/${chatId}/read`);
        } catch (error) {
            console.error('Ошибка отметки прочитанных:', error);
        }
    };
    
    const loadChat = async () => {
        try {
            const data = await chatService.getChatById(chatId);
            setChat(data);
        } catch (error) {
            console.error('Ошибка загрузки чата:', error);
        }
    };
    
    const loadMessages = async () => {
        setLoading(true);
        try {
            const data = await chatService.getMessages(chatId, 0, 100);
            setMessages(data.content.reverse());
            await markAsRead();
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSendText = async () => {
        if (!newMessage.trim() || sending || !connected) return;
        
        setSending(true);
        try {
            await chatService.sendMessage(chatId, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Ошибка отправки:', error);
        } finally {
            setSending(false);
        }
    };
    
    const handleSendWithFiles = async () => {
        if ((!newMessage.trim() && selectedFiles.length === 0) || sending || !connected) return;
        
        setSending(true);
        try {
            const formData = new FormData();
            formData.append('chatId', chatId);
            formData.append('content', newMessage || '📎 Файл');
            
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            
            await api.post('/api/chats/messages/with-file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setNewMessage('');
            setSelectedFiles([]);
            setAnchorEl(null);
        } catch (error) {
            console.error('Ошибка отправки:', error);
        } finally {
            setSending(false);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendText();
        }
    };
    
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
        setAnchorEl(null);
    };
    
    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    
    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) return <ImageIcon fontSize="small" />;
        return <DescriptionIcon fontSize="small" />;
    };
    
    const getChatName = () => {
        if (!chat) return 'Чат';
        if (chat.type === 'GROUP') return chat.name;
        const otherUser = chat.participants?.find(p => p.id !== user?.id);
        return otherUser?.fullName || 'Приватный чат';
    };
    
    const getAvatar = () => {
        if (!chat) return null;
        if (chat.type === 'GROUP') {
            return <Avatar sx={{ bgcolor: '#1976d2' }}>👥</Avatar>;
        }
        const otherUser = chat.participants?.find(p => p.id !== user?.id);
        const avatarUrl = otherUser?.avatarUrl;
        const initials = otherUser?.fullName?.[0] || otherUser?.firstName?.[0] || '?';
        
        if (avatarUrl) {
            return <Avatar src={`http://localhost:8080${avatarUrl}`} />;
        }
        return <Avatar sx={{ bgcolor: '#4caf50' }}>{initials}</Avatar>;
    };
    
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
            {/* Header чата */}
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 0 }}>
                {getAvatar()}
                <Box>
                    <Typography variant="h6">{getChatName()}</Typography>
                    <Typography variant="caption" color="textSecondary">
                        {chat?.type === 'GROUP' ? `${chat?.participants?.length} участников` : 'Приватный чат'}
                        {connected ? ' 🟢 Online' : ' 🔴 Offline'}
                    </Typography>
                </Box>
            </Paper>
            
            {/* Сообщения — скроллится */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {messages.length === 0 && (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
                        Нет сообщений. Напишите что-нибудь!
                    </Typography>
                )}
                {messages.map((msg, index) => {
                    const isMyMessage = msg.senderId === user?.id;
                    return (
                        <Box
                            key={msg.id || index}
                            sx={{
                                display: 'flex',
                                justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                                mb: 1.5,
                            }}
                        >
                            {!isMyMessage && (
                                <Avatar sx={{ width: 32, height: 32, mr: 1, mt: 0.5 }}>
                                    {msg.senderName?.[0] || '?'}
                                </Avatar>
                            )}
                            <Box sx={{ maxWidth: '70%' }}>
                                {!isMyMessage && (
                                    <Typography variant="caption" sx={{ display: 'block', ml: 1, mb: 0.5, color: '#666' }}>
                                        {msg.senderName}
                                    </Typography>
                                )}
                                <Paper
                                    sx={{
                                        p: 1.5,
                                        bgcolor: isMyMessage ? '#1976d2' : '#fff',
                                        color: isMyMessage ? 'white' : 'inherit',
                                        borderRadius: 2,
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {msg.content}
                                    </Typography>
                                    
                                    {msg.files && msg.files.length > 0 && (
                                        <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                                            {msg.files.map(file => (
                                                <Chip
                                                    key={file.id}
                                                    icon={file.fileType?.startsWith('image/') ? <ImageIcon /> : <DescriptionIcon />}
                                                    label={file.fileName}
                                                    size="small"
                                                    component="a"
                                                    href={`http://localhost:8080${file.downloadUrl}`}
                                                    clickable
                                                    sx={{ m: 0.5, bgcolor: isMyMessage ? 'rgba(255,255,255,0.2)' : '#f0f0f0' }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                    
                                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7 }}>
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                        {msg.isRead && isMyMessage && ' ✓✓'}
                                    </Typography>
                                </Paper>
                            </Box>
                            {isMyMessage && (
                                <Avatar sx={{ width: 32, height: 32, ml: 1, mt: 0.5 }}>
                                    {user?.firstName?.[0] || 'Я'}
                                </Avatar>
                            )}
                        </Box>
                    );
                })}
                <div ref={messagesEndRef} />
            </Box>
            
            {/* Выбранные файлы для отправки */}
            {selectedFiles.length > 0 && (
                <Paper sx={{ p: 1, mx: 2, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedFiles.map((file, idx) => (
                        <Chip
                            key={idx}
                            icon={getFileIcon(file)}
                            label={file.name}
                            onDelete={() => removeFile(idx)}
                            size="small"
                        />
                    ))}
                </Paper>
            )}
            
            {/* Ввод сообщения */}
            <Paper sx={{ p: 1, m: 2, mt: 0, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2 }}>
                <IconButton onClick={handleMenuOpen} disabled={!connected} size="small">
                    <AttachFileIcon />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem component="label">
                        Выбрать файлы
                        <input type="file" hidden multiple onChange={handleFileSelect} />
                    </MenuItem>
                </Menu>
                
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder={connected ? "Введите сообщение..." : "Подключение к чату..."}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!connected || sending}
                    variant="outlined"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <IconButton
                    color="primary"
                    onClick={selectedFiles.length > 0 ? handleSendWithFiles : handleSendText}
                    disabled={(!newMessage.trim() && selectedFiles.length === 0) || !connected || sending}
                    sx={{ bgcolor: '#1976d2', color: 'white', '&:hover': { bgcolor: '#1565c0' }, '&.Mui-disabled': { bgcolor: '#ccc' } }}
                >
                    <SendIcon />
                </IconButton>
            </Paper>
        </Box>
    );
};

export default ChatWindow;