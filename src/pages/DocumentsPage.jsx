import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    IconButton, Pagination, Box, CircularProgress, Alert, Chip, Button
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { fileService } from '../services/fileService';
import { api } from '../services/api';  // ← ДОБАВИТЬ ЭТУ СТРОКУ
import { useAuth } from '../context/AuthContext';

const DocumentsPage = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        loadFiles();
    }, [page]);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const data = await fileService.getAll(page, 20);
            setFiles(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Ошибка загрузки файлов');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (file) => {
        fileService.download(file.id, file.fileName);
    };

    const handleDelete = async (fileId) => {
        if (window.confirm('Удалить файл?')) {
            try {
                await fileService.delete(fileId);
                await loadFiles();
            } catch (err) {
                console.error('Ошибка удаления:', err);
            }
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            await api.post('/api/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await loadFiles();
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            setError('Ошибка загрузки файла');
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType?.startsWith('image/')) return <ImageIcon color="primary" />;
        if (fileType === 'application/pdf') return <PictureAsPdfIcon color="error" />;
        return <DescriptionIcon color="action" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (loading && files.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Документы</Typography>
                <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    component="label"
                >
                    Загрузить файл
                    <input
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                    />
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {files.length === 0 && !error && (
                <Alert severity="info">
                    Нет загруженных файлов. Загрузите первый файл!
                </Alert>
            )}

            {files.length > 0 && (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Тип</TableCell>
                            <TableCell>Имя файла</TableCell>
                            <TableCell>Размер</TableCell>
                            <TableCell>Загрузил</TableCell>
                            <TableCell>Дата</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {files.map((file) => (
                            <TableRow key={file.id}>
                                <TableCell>{getFileIcon(file.fileType)}</TableCell>
                                <TableCell>{file.fileName}</TableCell>
                                <TableCell>{formatFileSize(file.size)}</TableCell>
                                <TableCell>{file.uploaderName}</TableCell>
                                <TableCell>{new Date(file.uploadedAt).toLocaleString()}</TableCell>
                                <TableCell>
                                    <IconButton size="small" onClick={() => handleDownload(file)} color="primary">
                                        <DownloadIcon />
                                    </IconButton>
                                    {(file.uploaderName === `${user?.firstName} ${user?.lastName}` || user?.email === 'admin@tandem.com') && (
                                        <IconButton size="small" onClick={() => handleDelete(file.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

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
        </Container>
    );
};

export default DocumentsPage;