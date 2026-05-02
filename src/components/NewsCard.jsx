import React from 'react';
import { Card, CardContent, Typography, CardActions, Button, Chip, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useAuth } from '../context/AuthContext';

const NewsCard = ({ news, onEdit, onDelete }) => {
    const { user } = useAuth();
    const isAuthor = news.authorName === `${user?.firstName} ${user?.lastName}`;
    const hasFiles = news.files && news.files.length > 0;

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    {news.title}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                    {news.authorName} | {new Date(news.createdAt).toLocaleString()}
                </Typography>
                {news.isPinned && (
                    <Chip label="Закреплено" size="small" color="primary" sx={{ ml: 1 }} />
                )}
                <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                    {news.content}
                </Typography>
                
                {/* Файлы новости */}
                {hasFiles && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                            <AttachFileIcon fontSize="small" /> Прикреплённые файлы:
                        </Typography>
                        {news.files.map((file) => (
                            <Chip
                                key={file.id}
                                label={file.fileName}
                                size="small"
                                component="a"
                                href={`http://localhost:8080${file.downloadUrl}`}
                                clickable
                                sx={{ m: 0.5 }}
                            />
                        ))}
                    </Box>
                )}
            </CardContent>
            {(isAuthor || user?.email === 'admin@example.com') && (
                <CardActions>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(news)}>
                        Редактировать
                    </Button>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(news.id)}>
                        Удалить
                    </Button>
                </CardActions>
            )}
        </Card>
    );
};

export default NewsCard;