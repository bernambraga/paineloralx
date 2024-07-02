import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Home = () => {
    const { user } = useContext(AuthContext)

    return (
        <div>
            <h2>Home</h2>
            {user ? (
                <div>
                    <p>Bem vindo, {user.username}.</p>
                </div>
            ) : (
                <p>Erro no Login.</p>
            )}
        </div>
    )
}

export default Home
