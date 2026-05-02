import React, { useState } from 'react';
import {
    Modal, Box, TextField, Button, Typography, IconButton,
    List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

const NewsForm = ({ open, onClose, onSubmit, initialData = null }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

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
            await onSubmit(title, content, files);
            handleClose();
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setContent('');
        setFiles([]);
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" gutterBottom>
                    {initialData ? 'Редактировать новость' : 'Создать новость'}
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
                        label="Содержание"
                        multiline
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        margin="normal"
                        required
                    />
                    
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
                        <Button fullWidth variant="outlined" onClick={handleClose}>
                            Отмена
                        </Button>
                        <Button fullWidth type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Сохранение...' : (initialData ? 'Обновить' : 'Создать')}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
};

export default NewsForm;