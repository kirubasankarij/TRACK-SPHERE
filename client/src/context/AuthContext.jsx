import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set axios default base URL if needed, but vite proxy is usually enough
    axios.defaults.baseURL = '/api';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setUser(JSON.parse(userStr));
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            const { token, user: userData } = res.data;

            // Note: The backend currently returns { token }, let's assume it might return user or we need to decode
            localStorage.setItem('token', token);

            // Mocking user data from token or separate call if backend doesn't provide it
            // For this project, we'll store a simple user object
            const userObj = userData || { email, role: 'customer', name: email.split('@')[0] };
            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.msg || 'Login failed'
            };
        }
    };

    const register = async (name, email, phone, password, role = 'customer') => {
        try {
            const res = await axios.post('/auth/register', { name, email, phone, password, role });
            // Registration successful - don't log in automatically yet as per user request
            // (User wants to see success message then click login)
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.msg || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
