import React, { useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import ChatList from '../components/ChatList';

const ChatPage = () => {
    const [selectedChatId, setSelectedChatId] = useState(null);

    return (
        <Grid container sx={{ height: 'calc(100vh - 100px)' }}>
            {/* Список чатов — 30% ширины */}
            <Grid item xs={12} md={4} sx={{ borderRight: 1, borderColor: 'divider' }}>
                <ChatList onSelectChat={setSelectedChatId} selectedChatId={selectedChatId} />
            </Grid>
            
            {/* Окно чата — 70% ширины */}
            <Grid item xs={12} md={8}>
                {selectedChatId ? (
                    <Box sx={{ p: 2, height: '100%' }}>
                        {/* Здесь будет ChatWindow (сделаем в следующей части) */}
                        <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="body1" color="textSecondary">
                                Выберите чат или создайте новый
                            </Typography>
                        </Paper>
                    </Box>
                ) : (
                    <Box sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" color="textSecondary">
                            Выберите чат слева
                        </Typography>
                    </Box>
                )}
            </Grid>
        </Grid>
    );
};

export default ChatPage;