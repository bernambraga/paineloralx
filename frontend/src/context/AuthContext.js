import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:8000/api/login/', { username, password });
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
            await axios.post('http://localhost:8000/api/logout/', {}, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            setUser(null);
            localStorage.removeItem('token');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('http://localhost:8000/api/user/', {
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
