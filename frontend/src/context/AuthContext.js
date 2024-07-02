import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:8000/users/login/', { username, password });
            setUser(response.data);
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error) {
            console.error('Login failed', error);
            return null;
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:8000/users/logout/', {}, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            setUser(null);
            localStorage.removeItem('token');
            return true; // Indica que o logout foi bem-sucedido
        } catch (error) {
            console.error('Logout failed', error);
            return false; // Indica que o logout falhou
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('http://localhost:8000/users/user/', {
                        headers: {
                            'Authorization': `Token ${token}`
                        }
                    });
                    setUser(response.data);
                } catch (error) {
                    console.error('Authentication check failed', error);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
