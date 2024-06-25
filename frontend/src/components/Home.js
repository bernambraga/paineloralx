import React from 'react';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/logout/', {}, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      localStorage.removeItem('token');
      onLogout();
      navigate('/');
    } catch (error) {
      console.error('There was an error logging out!', error);
    }
  };

  return (
    <Layout user={user} onLogout={handleLogout}>
      <h2>Home Page</h2>
      <p>Welcome to the home page!</p>
    </Layout>
  );
};

export default Home;
