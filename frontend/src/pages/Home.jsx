import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const Home = () => {
    const { user } = useContext(AuthContext)

    return (
        <div className='container'>
            <div className="construction-container">
                <h2>Bem-vindo ao Painel Oral X</h2>
                {user && <p>Olá, {user.user}!</p>}
            </div>
        </div>
    )
}

export default Home
