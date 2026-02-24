import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['x-auth-token'] = token;
                try {
                    const res = await axios.get('http://localhost:5000/api/auth/profile');
                    setUser(res.data);
                } catch (err) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        
        
        const userData = { 
            id: res.data.user.id, 
            name: res.data.user.name, 
            email: res.data.user.email,
            role: res.data.user.role,
            isVerified: res.data.user.isVerified 
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
        
        // --- AJOUT DE LA REDIRECTION VERS L'ACCUEIL ---
        window.location.href = '/'; 
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
