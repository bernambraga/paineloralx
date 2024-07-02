import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Função para obter o token CSRF dos cookies
    const getCSRFToken = () => {
        let csrfToken = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === 'csrftoken=') {
                    csrfToken = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return csrfToken;
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:8000/users/login/', 
                { username, password },
                {
                    headers: {
                        'X-CSRFToken': getCSRFToken()
                    },
                    withCredentials: true
                }
            );
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
                    'X-CSRFToken': getCSRFToken(),
                    'Authorization': `Token ${localStorage.getItem('token')}`
                },
                withCredentials: true
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
