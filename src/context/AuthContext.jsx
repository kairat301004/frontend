import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = authService.getCurrentUser();
        if (savedUser) {
            // Загружаем полный профиль
            userService.getCurrentUser().then(fullUser => {
                setUser(fullUser);
            }).catch(() => setUser(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const userData = await authService.login(email, password);
        // Загружаем полный профиль после логина
        const fullUser = await userService.getCurrentUser();
        setUser(fullUser);
        return fullUser;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const updateUser = (userData) => {
    setUser(userData);
    // Обновляем localStorage
    const userForStorage = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
    };
    localStorage.setItem('tandem_user', JSON.stringify(userForStorage));
};

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};