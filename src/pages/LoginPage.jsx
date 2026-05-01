import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Container, Paper, TextField, Button, Typography, Alert, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            // Перенаправляем на главную
            navigate('/')
        } catch (err) {
            setError('Неверный email или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Tandem
                    </Typography>
                    <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
                        Вход в корпоративную платформу
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="Пароль"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                            disabled={loading}
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3 }}
                        >
                            {loading ? 'Вход...' : 'Войти'}
                        </Button>
                    </form>

                    <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                        Тестовые данные: admin@tandem.com / password
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;