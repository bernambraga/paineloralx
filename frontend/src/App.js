import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SAC from './pages/SAC'
import Bots from './pages/Bots'
import Senhas from './pages/Senhas'
import Comercial from './pages/Comercial'
import Top15 from './pages/Top15'
import Header from './components/Header/Header'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './PrivateRoute'

const App = () => {
    return (
        <div className="App">
            <AuthProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </AuthProvider>
        </div>
    )
}

const AppContent = () => {
    const [showNavBar, setShowNavBar] = React.useState(false)
    const location = useLocation()

    React.useEffect(() => {
        // Oculta a navbar e sidebar se estiver na rota de login
        if (location.pathname === '/') {
            setShowNavBar(false)
        } else {
            setShowNavBar(true)
        }
    }, [location])

    return (
        <>
            <Header show={showNavBar} />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<PrivateRoute />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/comercial/geral" element={<Comercial />} />
                    <Route path="/comercial/top15" element={<Top15 />} />
                    <Route path="/bots" element={<Bots />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/sac" element={<SAC />} />
                    <Route path="/senhas" element={<Senhas />} />
                </Route>
            </Routes>
        </>
    )
}

export default App
