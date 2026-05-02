import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Paper, TextField, IconButton, Typography, Avatar, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';

const ChatWindow = ({ chatId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [chat, setChat] = useState(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    
    const WEBSOCKET_URL = 'http://localhost:8080/ws/chat';
    
    const handleWebSocketMessage = useCallback((message) => {
        console.log('Новое сообщение через WebSocket:', message);
        if (message.chatId === chatId) {
            setMessages(prev => [...prev, message]);
        }
    }, [chatId]);
    
    const { connected, sendMessage, subscribeToChat } = useWebSocket(
        WEBSOCKET_URL,
        handleWebSocketMessage,
        null
    );
    
    // Подписываемся на чат при подключении WebSocket и смене чата
    useEffect(() => {
        if (connected && chatId) {
            subscribeToChat(chatId);
        }
    }, [connected, chatId, subscribeToChat]);
    
    useEffect(() => {
        if (chatId) {
            loadChat();
            loadMessages();
        }
    }, [chatId]);
    
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
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSend = async () => {
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
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    const getChatName = () => {
        if (!chat) return 'Чат';
        if (chat.type === 'GROUP') return chat.name;
        // Исправлено: используем user из AuthContext
        const otherUser = chat.participants?.find(p => p.id !== user?.id);
        return otherUser?.fullName || 'Приватный чат';
    };
    
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: chat?.type === 'GROUP' ? '#1976d2' : '#4caf50' }}>
                    {chat?.type === 'GROUP' ? '👥' : '👤'}
                </Avatar>
                <Box>
                    <Typography variant="h6">{getChatName()}</Typography>
                    <Typography variant="caption" color="textSecondary">
                        {chat?.type === 'GROUP' ? `${chat?.participants?.length} участников` : 'Приватный чат'}
                        {connected ? ' 🟢 Online' : ' 🔴 Offline'}
                    </Typography>
                </Box>
            </Paper>
            
            <Box sx={{ flex: 1, overflow: 'auto', mb: 2, px: 1 }}>
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
                                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                                    {msg.senderName?.[0] || '?'}
                                </Avatar>
                            )}
                            <Paper
                                sx={{
                                    p: 1.5,
                                    maxWidth: '70%',
                                    bgcolor: isMyMessage ? '#1976d2' : '#f5f5f5',
                                    color: isMyMessage ? 'white' : 'inherit',
                                    borderRadius: 2,
                                }}
                            >
                                {!isMyMessage && (
                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', mb: 0.5 }}>
                                        {msg.senderName}
                                    </Typography>
                                )}
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {msg.content}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7 }}>
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </Typography>
                            </Paper>
                            {isMyMessage && (
                                <Avatar sx={{ width: 32, height: 32, ml: 1 }}>
                                    {user?.firstName?.[0] || 'Я'}
                                </Avatar>
                            )}
                        </Box>
                    );
                })}
                <div ref={messagesEndRef} />
            </Box>
            
            <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
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
                />
                <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={!newMessage.trim() || !connected || sending}
                >
                    <SendIcon />
                </IconButton>
            </Paper>
        </Box>
    );
};

export default ChatWindow;