import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LINKS } from '../../data'
import classes from './style.module.css'
import {IoMenuOutline as MenuIcon} from 'react-icons/io5'
import { AuthContext } from '../../context/AuthContext'



const Sidebar = ({isOpen, closeSidebar}) => {
    const { user, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const user = await logout
        if (user) {
            navigate('/')
        } else {
            alert('Logout failed')
        }
    }

    return (
        <div className={`${classes.sidebar} ${isOpen && classes.open}`}>
            <span className={classes.closeIcon} onClick={closeSidebar}>
                <MenuIcon size={30}/>
            </span>
            {/* Links */}
            <div className={classes.links}>
                {LINKS.map(link => (
                        <NavLink 
                        key={link.name}
                        to={link.to} 
                        className={({ isActive }) => (isActive ? classes.activeLink : '')}
                        onClick={closeSidebar}
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
    )
}

export default Sidebar