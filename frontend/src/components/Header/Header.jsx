import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import classes from './style.module.css'
import {IoMenuOutline as MenuIcon} from 'react-icons/io5'
import {LINKS} from '../../data'
import Sidebar from '../Sidebar/Sidebar'

const Header = () => {
    const [isOpen, setIsOpen] = useState(false)

    const openSidebar = () => {
        setIsOpen(true)
    }

    const closeSidebar = () => {
        setIsOpen(false)
    }

  return (
    <header>
        <div className={classes.navbar}>
            {/* Logo */}
            <div className={classes.logo}>
                <NavLink to='/'>Oral X</NavLink>
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
                <NavLink to='/login' className={classes.login}>Login</NavLink>
            </div>
            {/* Ham Menu Btn */}
            <div className={classes.menuBtn} onClick={openSidebar}>
                <MenuIcon size={30}/>
            </div>
        </div>
        
        {/* Sidebar */}
        <Sidebar isOpen={isOpen} closeSidebar={closeSidebar}/>
    </header>
  )
}

export default Header