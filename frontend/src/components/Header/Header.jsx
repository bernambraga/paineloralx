import React, { useState, useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import classes from './style.module.css'
import {IoMenuOutline as MenuIcon} from 'react-icons/io5'
import {LINKS} from '../../data'
import Sidebar from '../Sidebar/Sidebar'
import { AuthContext } from '../../context/AuthContext'

const Header = ({ show }) => {
    const { logout } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await logout()
        if (success) {
            navigate('/')
        } else {
            alert('Logout failed')
        }
    }

    const [isOpen, setIsOpen] = useState(false)
    
    const openSidebar = () => {
        setIsOpen(true)
    }

    const closeSidebar = () => {
        setIsOpen(false)
    }

    if (!show){
        return null
    }

    return (
        <header>
            <div className={classes.navbar}>
                {/* Ham Menu Btn */}
                <div className={classes.menuBtn} onClick={openSidebar}>
                    <MenuIcon size={30}/>
                </div>
                {/* Logo */}
                <div className={classes.logo}>
                    <NavLink to='/home'>Oral X</NavLink>
                </div>
                {/* Links */}
                <div className={classes.links}>
                    {LINKS.map(link => (
                        <NavLink 
                        key={link.name}
                        to={link.to} 
                        className={({ isActive }) => (isActive ? classes.activeLink : '')}
                        >
                            {link.name}
                        </NavLink>
                        ))
                    }
                </div>
                {/* Auth Links */}
                <div className={classes.auth}>
                    <button onClick={handleSubmit} className={classes.login}>Sair</button>
                </div>
            </div>
            
            {/* Sidebar */}
            <Sidebar isOpen={isOpen} closeSidebar={closeSidebar}/>
        </header>
    )
}

export default Header