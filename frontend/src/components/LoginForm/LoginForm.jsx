import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import './LoginForm.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
      e.preventDefault()
      const user = await login(username, password)
      if (user) {
          navigate('/home')
      } else {
          alert('Login failed')
      }
  }

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
            type="username"
            name='username'
            autoComplete='username'
            value={username} 
            onChange={(event) => setUsername(event.target.value)} 
            required
          />
          <label>Senha</label>
          <input 
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password} 
            onChange={(event) => setPassword(event.target.value)} 
            required
          />
          <button type="submit">Continuar</button>
          
        </form>
      </div>
      <div className="footer">
        <p>Oral X</p>
        <p>&copy; 2024</p>
      </div>
    </div>
  )
}

export default Login