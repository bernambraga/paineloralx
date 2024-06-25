import React from 'react';

const Home = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div>
      <h2>Home Page</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
