import React, { useState, useEffect } from 'react';
import {
    Modal, Box, TextField, Button, Typography, FormControl,
    InputLabel, Select, MenuItem, Grid, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { api } from '../services/api';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '90vh',
    overflow: 'auto',
};

const TaskForm = ({ open, onClose, onSubmit, initialData = null }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [status, setStatus] = useState(initialData?.status || 'TODO');
    const [priority, setPriority] = useState(initialData?.priority || 'MEDIUM');
    const [deadline, setDeadline] = useState(initialData?.deadline?.slice(0, 16) || '');
    const [assignedId, setAssignedId] = useState(initialData?.assignedId || '');
    const [users, setUsers] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Загружаем список пользователей для назначения
        const loadUsers = async () => {
            try {
                const response = await api.get('/api/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Ошибка загрузки пользователей:', error);
            }
        };
        loadUsers();
    }, []);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const handleRemoveFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({
                title,
                description,
                status,
                priority,
                deadline: deadline || null,
                assignedId: assignedId || null,
            }, files);  // ← передаём файлы
            handleClose();
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setStatus('TODO');
        setPriority('MEDIUM');
        setDeadline('');
        setAssignedId('');
        setFiles([]);
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" gutterBottom>
                    {initialData ? 'Редактировать задачу' : 'Создать задачу'}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Заголовок"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Описание"
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        margin="normal"
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Статус</InputLabel>
                                <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Статус">
                                    <MenuItem value="TODO">📋 To Do</MenuItem>
                                    <MenuItem value="IN_PROGRESS">🔄 In Progress</MenuItem>
                                    <MenuItem value="DONE">✅ Done</MenuItem>
                                    <MenuItem value="CANCELLED">❌ Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Приоритет</InputLabel>
                                <Select value={priority} onChange={(e) => setPriority(e.target.value)} label="Приоритет">
                                    <MenuItem value="LOW">🟢 Low</MenuItem>
                                    <MenuItem value="MEDIUM">🟡 Medium</MenuItem>
                                    <MenuItem value="HIGH">🟠 High</MenuItem>
                                    <MenuItem value="URGENT">🔴 Urgent</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <TextField
                        fullWidth
                        type="datetime-local"
                        label="Дедлайн"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Исполнитель</InputLabel>
                        <Select value={assignedId} onChange={(e) => setAssignedId(e.target.value)} label="Исполнитель">
                            <MenuItem value="">Не назначен</MenuItem>
                            {users.map(user => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName} ({user.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Выбор файлов */}
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<AttachFileIcon />}
                        sx={{ mt: 2 }}
                    >
                        Прикрепить файлы
                        <input
                            type="file"
                            hidden
                            multiple
                            onChange={handleFileChange}
                        />
                    </Button>

                    {/* Список выбранных файлов */}
                    {files.length > 0 && (
                        <List dense>
                            {files.map((file, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button fullWidth variant="outlined" onClick={handleClose}>Отмена</Button>
                        <Button fullWidth type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Сохранение...' : (initialData ? 'Обновить' : 'Создать')}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
};

export default TaskForm;