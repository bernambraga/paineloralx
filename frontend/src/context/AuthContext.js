import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getBaseUrl = () => {
        return window.location.hostname === 'localhost'
            ? 'http://localhost:8000'
            : 'https://paineloralx.com.br';
    };

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

    useEffect(() => {
        const getCSRFTokenFromServer = async () => {
            const baseUrl = getBaseUrl();
            await axios.get(`${baseUrl}/api/csrf/`);
        };

        getCSRFTokenFromServer();
    }, []);

    const login = async (username, password) => {
        try {
            const baseUrl = getBaseUrl();
            const csrfToken = getCSRFToken();

            const response = await axios.post(
                `${baseUrl}/api/login/`,
                { username, password },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                    withCredentials: true,
                }
            );

            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            setUser(jwtDecode(access));
            return response.data;
        } catch (error) {
            console.error('Login failed', error.response || error);
            return null;
        }
    };

    const logout = async () => {
        try {
            const refresh_token = localStorage.getItem('refresh_token');
            if (refresh_token) {
                const csrfToken = getCSRFToken();
                await axios.post(
                    `${getBaseUrl()}/api/logout/`,
                    { refresh_token },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken,
                        },
                        withCredentials: true,
                    }
                );
            }
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            return true;
        } catch (error) {
            console.error('Logout failed', error);
            return false;
        }
    };

    const refreshAccessToken = async () => {
        try {
            const refresh_token = localStorage.getItem('refresh_token');
            const response = await axios.post(
                `${getBaseUrl()}/api/token/refresh/`,
                { refresh: refresh_token },
                { headers: { 'Content-Type': 'application/json' } }
            );
            localStorage.setItem('access_token', response.data.access);
            setUser(jwtDecode(response.data.access));
        } catch (error) {
            console.error('Token refresh failed', error);
            logout();
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                setUser(jwtDecode(token));
            } else {
                const refresh_token = localStorage.getItem('refresh_token');
                if (refresh_token) {
                    await refreshAccessToken();
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
