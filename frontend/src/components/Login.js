import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';

const getCsrfToken = async () => {
  try {
    const response = await axios.get('/api/csrf/');
    const csrfToken = response.data.csrfToken;
    axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
};

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getCsrfToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login/', {
        username: username,
        password: password,
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        onLoginSuccess();
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
