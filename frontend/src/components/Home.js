import React from 'react';
import axios from 'axios';

const Home = () => {
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/logout/', {}, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (error) {
      console.error('There was an error logging out!', error);
    }
  };

  return (
    <div>
      <h2>Home Page</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
