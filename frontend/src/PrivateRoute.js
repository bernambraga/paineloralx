import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

const PrivateRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        // Renderiza um componente de carregamento enquanto verifica a autenticação
        return <div>Loading...</div>;
    }

    // Se o usuário não estiver autenticado, redireciona para a página de login
    return user ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
