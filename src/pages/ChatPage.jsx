import React, { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
    const [selectedChatId, setSelectedChatId] = useState(null);

    return (
        <Grid container sx={{ height: 'calc(100vh - 100px)' }}>
            {/* Список чатов — 30% ширины */}
            <Grid item xs={12} md={4} sx={{ borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
                <ChatList onSelectChat={setSelectedChatId} selectedChatId={selectedChatId} />
            </Grid>
            
            {/* Окно чата — 70% ширины */}
            <Grid item xs={12} md={8} sx={{ height: '100%' }}>
                {selectedChatId ? (
                    <ChatWindow chatId={selectedChatId} />
                ) : (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="textSecondary" gutterBottom>
                                Выберите чат
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Или создайте новый, нажав на кнопку выше
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Grid>
        </Grid>
    );
};

export default ChatPage;