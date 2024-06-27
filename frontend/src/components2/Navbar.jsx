// src/components/Navbar.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Navbar.css';

const Navbar = ({ onLogout }) => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get('/api/user/');
                setUsername(response.data.username);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, []);

    return (
        <div className="navbar">
            <div className="navbar-left">
                <h1 className="navbar__title">Oral X</h1>
            </div>
            <div className="navbar-right">
                <div className='profile'>
                    <h3 className="navbar-user">{username}</h3>
                </div>
                <div className='logout'>
                    <button className="navbar-logout" onClick={onLogout}>Logout</button>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
