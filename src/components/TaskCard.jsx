import React from 'react';
import { Card, CardContent, Typography, CardActions, Button, Chip, Box, MenuItem, Select, FormControl } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useAuth } from '../context/AuthContext';

const statusColors = {
    TODO: '#9e9e9e',
    IN_PROGRESS: '#2196f3',
    DONE: '#4caf50',
    CANCELLED: '#f44336',
};

const priorityColors = {
    LOW: '#8bc34a',
    MEDIUM: '#ff9800',
    HIGH: '#ff5722',
    URGENT: '#f44336',
};

const statusLabels = {
    TODO: '📋 To Do',
    IN_PROGRESS: '🔄 In Progress',
    DONE: '✅ Done',
    CANCELLED: '❌ Cancelled',
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, currentUserId }) => {
    const { user } = useAuth();
    const isCreator = task.creatorName === `${user?.firstName} ${user?.lastName}`;
    const canEdit = isCreator || user?.email === 'admin@tandem.com';
    const hasFiles = task.files && task.files.length > 0;

    return (
        <Card sx={{ mb: 2, borderLeft: 4, borderLeftColor: priorityColors[task.priority] || '#ccc' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <Typography variant="h6" gutterBottom>
                        {task.title}
                    </Typography>
                    <Box>
                        <Chip label={task.priority} size="small" sx={{ bgcolor: priorityColors[task.priority], color: 'white', mr: 1 }} />
                        <Chip label={statusLabels[task.status]} size="small" sx={{ bgcolor: statusColors[task.status], color: 'white' }} />
                    </Box>
                </Box>
                
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Создал: {task.creatorName} | 
                    {task.assignedName && ` Исполнитель: ${task.assignedName}`}
                    {task.deadline && ` | Дедлайн: ${new Date(task.deadline).toLocaleString()}`}
                </Typography>
                
                {task.description && (
                    <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                        {task.description}
                    </Typography>
                )}
                
                {/* 🔥 Файлы задачи */}
                {hasFiles && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                            <AttachFileIcon fontSize="small" /> Прикреплённые файлы:
                        </Typography>
                        {task.files.map((file) => (
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
            <CardActions>
                {canEdit && (
                    <>
                        <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(task)}>
                            Редактировать
                        </Button>
                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(task.id)}>
                            Удалить
                        </Button>
                    </>
                )}
                <FormControl size="small" sx={{ minWidth: 120, ml: 'auto' }}>
                    <Select
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="TODO">📋 To Do</MenuItem>
                        <MenuItem value="IN_PROGRESS">🔄 In Progress</MenuItem>
                        <MenuItem value="DONE">✅ Done</MenuItem>
                        <MenuItem value="CANCELLED">❌ Cancelled</MenuItem>
                    </Select>
                </FormControl>
            </CardActions>
        </Card>
    );
};

export default TaskCard;