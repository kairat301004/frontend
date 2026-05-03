import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Avatar, TextField, Button,
    Grid, Box, Divider, Alert, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        position: '',
        phone: '',
    });
    const { user: authUser, updateUser } = useAuth();

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const data = await userService.getCurrentUser();
            setUser(data);
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                position: data.position || '',
                phone: data.phone || '',
            });
        } catch (err) {
            setError('Ошибка загрузки профиля');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        
        try {
            const updated = await userService.updateProfile(formData);
            setUser(updated);
            await updateUser(updated);
            setSuccess('Профиль обновлён');
            setIsEditing(false);
        } catch (err) {
            setError('Ошибка обновления профиля');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setSaving(true);
        setError('');
        setSuccess('');
        
        try {
            const updated = await userService.uploadAvatar(file);
            setUser(updated);
            await updateUser(updated);
            setSuccess('Аватар обновлён');
        } catch (err) {
            setError('Ошибка загрузки аватара');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>Профиль пользователя</Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                
                <Grid container spacing={4}>
                    {/* Аватар */}
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        <Avatar
                            src={user?.avatarUrl ? `http://localhost:8080${user.avatarUrl}` : null}
                            sx={{ width: 150, height: 150, margin: '0 auto', mb: 2 }}
                        >
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Avatar>
                        <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            disabled={saving}
                        >
                            {saving ? 'Загрузка...' : 'Сменить аватар'}
                            <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                        </Button>
                    </Grid>
                    
                    {/* Информация */}
                    <Grid item xs={12} md={8}>
                        {!isEditing ? (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">Личная информация</Typography>
                                    <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                                        Редактировать
                                    </Button>
                                </Box>
                                
                                <Divider sx={{ mb: 2 }} />
                                
                                <Typography variant="body1" gutterBottom>
                                    <strong>Email:</strong> {user?.email}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Имя:</strong> {user?.firstName} {user?.lastName}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Должность:</strong> {user?.position || 'Не указана'}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Телефон:</strong> {user?.phone || 'Не указан'}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Отдел:</strong> {user?.department?.name || 'Не указан'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Зарегистрирован: {new Date(user?.createdAt).toLocaleDateString()}
                                </Typography>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    label="Имя"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Фамилия"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Должность"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Телефон"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    margin="normal"
                                />
                                
                                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        disabled={saving}
                                    >
                                        {saving ? 'Сохранение...' : 'Сохранить'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CancelIcon />}
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Отмена
                                    </Button>
                                </Box>
                            </form>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default ProfilePage;