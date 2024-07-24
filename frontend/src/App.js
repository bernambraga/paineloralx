import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SAC from './pages/SAC'
import Bots from './pages/Bots'
import About from './pages/About'
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
                    <Route path="/about" element={<About />} />
                    <Route path="/bots" element={<Bots />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/sac" element={<SAC />} />
                </Route>
            </Routes>
        </>
    )
}

export default App
