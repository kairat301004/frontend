import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Button, Pagination, Box, CircularProgress, Alert, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'my'
    const { user } = useAuth();

    useEffect(() => {
        loadTasks();
    }, [page, filter]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            let data;
            if (filter === 'my') {
                data = await taskService.getMyTasks(page, 10);
            } else {
                data = await taskService.getAll(page, 10);
            }
            setTasks(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Ошибка загрузки задач');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (taskData, files) => {
        await taskService.create(taskData, files);
        await loadTasks();
    };

    const handleUpdate = async (taskData, files) => {
        if (editingTask) {
            await taskService.update(editingTask.id, taskData);
            setEditingTask(null);
            await loadTasks();
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        await taskService.updateStatus(id, newStatus);
        await loadTasks();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить задачу?')) {
            await taskService.delete(id);
            await loadTasks();
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingTask(null);
    };

    const handleFilterChange = (event, newFilter) => {
        if (newFilter !== null) {
            setFilter(newFilter);
            setPage(0);
        }
    };

    if (loading && tasks.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4">Задачи</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <ToggleButtonGroup value={filter} exclusive onChange={handleFilterChange} size="small">
                        <ToggleButton value="all">Все задачи</ToggleButton>
                        <ToggleButton value="my">Мои задачи</ToggleButton>
                    </ToggleButtonGroup>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
                        Новая задача
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {tasks.length === 0 && !error && (
                <Alert severity="info">Нет задач. Создайте первую задачу!</Alert>
            )}

            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                    currentUserId={user?.id}
                />
            ))}

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page + 1}
                        onChange={(e, value) => setPage(value - 1)}
                        color="primary"
                    />
                </Box>
            )}

            <TaskForm
                open={modalOpen}
                onClose={handleModalClose}
                onSubmit={editingTask ? handleUpdate : handleCreate}
                initialData={editingTask}
            />
        </Container>
    );
};

export default TasksPage;