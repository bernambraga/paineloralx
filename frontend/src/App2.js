import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import axios from 'axios';
import {BrowserRouter, Routes, Route} from 'react-router-dom'



function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
    };

    return (
        <div className="App">
            {isLoggedIn ? (
                <>
                    <Navbar onLogout={handleLogout} />
                    <Home />
                </>
            ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
            )}
        </div>
    );
}

export default App;
