import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    IconButton, Button, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, Box, CircularProgress, Alert, Chip, MenuItem,
    FormControl, InputLabel, Select, Grid, Pagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [openResetPassword, setOpenResetPassword] = useState(false);
    const [resetPasswordUserId, setResetPasswordUserId] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        position: '',
        phone: '',
        departmentId: '',
        roleNames: [],
    });
    const [saving, setSaving] = useState(false);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadData();
    }, [page, search]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, rolesData, deptsData] = await Promise.all([
                adminService.getAllUsers(page, 20, search),
                adminService.getAllRoles(),
                adminService.getAllDepartments()
            ]);
            setUsers(usersData.content);
            setTotalPages(usersData.totalPages);
            setRoles(rolesData);
            setDepartments(deptsData);
        } catch (err) {
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingUser(null);
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            position: '',
            phone: '',
            departmentId: '',
            roleNames: [],
        });
        setOpenDialog(true);
    };

    const handleOpenEdit = (user) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            position: user.position || '',
            phone: user.phone || '',
            departmentId: user.departmentId || '',
            roleNames: user.roleNames || [],
        });
        setOpenDialog(true);
    };

    const handleOpenResetPassword = (userId) => {
        setResetPasswordUserId(userId);
        setNewPassword('');
        setOpenResetPassword(true);
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            return;
        }
        
        try {
            await adminService.resetPassword(resetPasswordUserId, newPassword);
            setSuccess('Пароль успешно сброшен');
            setOpenResetPassword(false);
        } catch (err) {
            setError('Ошибка сброса пароля');
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        
        try {
            if (editingUser) {
                await adminService.updateUser(editingUser.id, {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    position: formData.position,
                    phone: formData.phone,
                    departmentId: formData.departmentId,
                    roleNames: formData.roleNames,
                    status: 'ACTIVE',
                });
                setSuccess('Пользователь обновлён');
            } else {
                if (!formData.email || !formData.password) {
                    setError('Email и пароль обязательны');
                    return;
                }
                await adminService.createUser({
                    ...formData,
                    email: formData.email,
                    password: formData.password,
                });
                setSuccess('Пользователь создан');
            }
            setOpenDialog(false);
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить пользователя?')) {
            try {
                await adminService.deleteUser(id);
                setSuccess('Пользователь удалён');
                await loadData();
            } catch (err) {
                setError('Ошибка удаления');
            }
        }
    };

    const getRoleColor = (roleName) => {
        switch (roleName) {
            case 'ROLE_ADMIN': return 'error';
            case 'ROLE_MANAGER': return 'warning';
            default: return 'default';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'INACTIVE': return 'error';
            default: return 'default';
        }
    };

    if (loading && users.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl">
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4">Управление пользователями</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Поиск..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ width: 250 }}
                        />
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={() => loadData()}
                        >
                            Обновить
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreate}
                            color="primary"
                        >
                            Создать пользователя
                        </Button>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>Имя</TableCell>
                            <TableCell>Должность</TableCell>
                            <TableCell>Отдел</TableCell>
                            <TableCell>Роли</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.firstName} {user.lastName}</TableCell>
                                <TableCell>{user.position || '-'}</TableCell>
                                <TableCell>{user.departmentName || '-'}</TableCell>
                                <TableCell>
                                    {user.roleNames?.map(role => (
                                        <Chip
                                            key={role}
                                            label={role}
                                            size="small"
                                            color={getRoleColor(role)}
                                            sx={{ mr: 0.5, mb: 0.5 }}
                                        />
                                    ))}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.status}
                                        size="small"
                                        color={getStatusColor(user.status)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton size="small" onClick={() => handleOpenEdit(user)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleOpenResetPassword(user.id)}>
                                        <VpnKeyIcon />
                                    </IconButton>
                                    {user.email !== currentUser?.email && (
                                        <IconButton size="small" onClick={() => handleDelete(user.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

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
            </Paper>

            {/* Диалог создания/редактирования пользователя */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {!editingUser && (
                            <>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        label="Пароль"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        helperText="Минимум 6 символов"
                                    />
                                </Grid>
                            </>
                        )}
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Имя"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Фамилия"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Должность"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Телефон"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Отдел</InputLabel>
                                <Select
                                    value={formData.departmentId}
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                    label="Отдел"
                                >
                                    <MenuItem value="">Не выбран</MenuItem>
                                    {departments.map(dept => (
                                        <MenuItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Роли</InputLabel>
                                <Select
                                    multiple
                                    value={formData.roleNames}
                                    onChange={(e) => setFormData({ ...formData, roleNames: e.target.value })}
                                    label="Роли"
                                    renderValue={(selected) => selected.join(', ')}
                                >
                                    {roles.map(role => (
                                        <MenuItem key={role.id} value={role.name}>
                                            {role.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={saving}>
                        {saving ? 'Сохранение...' : (editingUser ? 'Обновить' : 'Создать')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог сброса пароля */}
            <Dialog open={openResetPassword} onClose={() => setOpenResetPassword(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Сброс пароля</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        type="password"
                        label="Новый пароль"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        margin="normal"
                        helperText="Минимум 6 символов"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenResetPassword(false)}>Отмена</Button>
                    <Button onClick={handleResetPassword} variant="contained" color="primary">
                        Сбросить
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminPage;

// import React from 'react';
// import { Container, Paper, Typography, Button } from '@mui/material';

// const AdminPage = () => {
//     return (
//         <Container>
//             <Paper sx={{ p: 3 }}>
//                 <Typography variant="h4">Админ-панель</Typography>
//                 <Button variant="contained" onClick={() => alert('Тест')}>
//                     Тестовая кнопка
//                 </Button>
//             </Paper>
//         </Container>
//     );
// };

// export default AdminPage;