import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import NewsPage from './pages/NewsPage';
import TasksPage from './pages/TasksPage';
import ChatPage from './pages/ChatPage';

// Временные заглушки для остальных страниц
// const TasksPage = () => <div>Страница задач (скоро)</div>;
// const ChatPage = () => <div>Страница чата (скоро)</div>;
const DocumentsPage = () => <div>Страница документов (скоро)</div>;
const NotificationsPage = () => <div>Страница уведомлений (скоро)</div>;

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<NewsPage />} />
                        <Route path="news" element={<NewsPage />} />
                        <Route path="tasks" element={<TasksPage />} />
                        <Route path="chat" element={<ChatPage />} />
                        <Route path="documents" element={<DocumentsPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;