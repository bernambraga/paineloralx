import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './LoginForm.css';
import { IoEyeOff } from "react-icons/io5";
import { IoEye } from "react-icons/io5";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('password');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await login(username, password);
    if (user) {
      navigate('/home');
    } else {
      alert('Login failed');
    }
  };

  const handleToggle = () => {
    setType(type === 'password' ? 'text' : 'password');
  };

  return (
    <div className="login-page">
      <div className="header">
        <img src="Logo.png" alt="Logo" />
      </div>
      <div className="content">
        <form onSubmit={handleSubmit}>
          <label>Usuário</label>
          <input 
            id='username'
            type="text"
            name='username'
            autoComplete='username'
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
          />
          <label>Senha</label>
          <div className="input-wrapper">
            <input 
              id="password"
              name="password"
              type={type}
              autoComplete="current-password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
            <span className="icon-eye" onClick={handleToggle}>
              {type === 'password' ? <IoEyeOff size={20} /> : <IoEye size={20} />}
            </span>
          </div>
          <button type="submit">Continuar</button>
        </form>
      </div>
      <div className="footer">
        <p>Oral X</p>
        <p>&copy; 2024</p>
      </div>
    </div>
  );
};

export default Login;
