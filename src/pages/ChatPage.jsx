import React, { useState } from 'react';
import { Box, Grid, Typography} from '@mui/material';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
    const [selectedChatId, setSelectedChatId] = useState(null);

    return (
        <Grid container sx={{ height: 'calc(100vh - 80px)', width: '100%', m: 0 }}>
            {/* Список чатов — 320px фиксированной ширины */}
            <Grid item sx={{ width: 320, flexShrink: 0, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
                <ChatList onSelectChat={setSelectedChatId} selectedChatId={selectedChatId} />
            </Grid>
            
            {/* Окно чата — занимает всё оставшееся пространство */}
            <Grid item sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
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