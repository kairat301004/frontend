import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
                        Tandem
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/news')}>Новости</Button>
                    <Button color="inherit" onClick={() => navigate('/tasks')}>Задачи</Button>
                    <Button color="inherit" onClick={() => navigate('/chat')}>Чат</Button>
                    <Button color="inherit" onClick={() => navigate('/documents')}>Документы</Button>
                    <Button color="inherit" onClick={() => navigate('/notifications')}>Уведомления</Button>
                    <Typography sx={{ ml: 2, mr: 2 }}>
                        {user?.firstName} {user?.lastName}
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>Выйти</Button>
                </Toolbar>
            </AppBar>
            <Container sx={{ mt: 4, flex: 1 }}>
                <Outlet />
            </Container>
        </Box>
    );
};

export default Layout;