import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);
    return (
        <div className="home-container1">
            <div className="home-container2">
                <h2>Bem-vindo ao Painel Oral X</h2>
            </div>

            {user && (
                <div className="user-info">
                    <h3>Dados do Usuário:</h3>
                    <ul>
                        {Object.entries(user).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong>{" "}
                                {Array.isArray(value)
                                    ? value.map((item) =>
                                        typeof item === "object" && item !== null
                                            ? item.nome || JSON.stringify(item)
                                            : item
                                    ).join(", ")
                                    : String(value)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Home;
