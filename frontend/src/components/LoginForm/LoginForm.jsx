import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './LoginForm.css';
import { IoEyeOff } from "react-icons/io5";
import { IoEye } from "react-icons/io5";

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(''); // Estado para o tipo de mensagem (success ou error)
  const [type, setType] = useState('password');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('');

    const response = await login(username, password);

    if (response && response.detail) {
      if (response.detail === 'User does not exist') {
        setErrorType('alerta');
        setError('Usuário não existe');
      } else if (response.detail === 'Incorrect password') {
        setErrorType('alerta');
        setError('Senha incorreta');
      } else {
        setErrorType('alerta');
        setError(response.detail);
      }
    } else if (response) {
      // Login successful, handle success case here if needed
      setErrorType('success');
      setError('Login realizado com sucesso');
      // Atrasar a navegação por 1 segundo (1000 milissegundos)
      setTimeout(() => {
        navigate('/home');
      }, 700);
    } else {
      setErrorType('alerta');
      setError('Um erro ocorreu. Por favor tente novamente.');
    }

    setTimeout(() => {
      setError('');
      setErrorType('');
    }, 2500);
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
          <input  className="passInput"
            id='username'
            name='username'
            autoComplete='username'
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
          />
          <label>Senha</label>
          <div className="input-wrapper">
            <input className="passInput"
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
          {error && (
            <div className={`error ${errorType}`}>{error}</div> // Exibir a mensagem temporária
          )}
          <button className="loginButton">Continuar</button>
        </form>
      </div>
      <div className="footer">
        <p>Oral X</p>
        <p>&copy; 2024</p>
      </div>
    </div>
  );
};

export default LoginForm;
