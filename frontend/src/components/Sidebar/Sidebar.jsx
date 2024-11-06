import React, { useContext, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LINKS } from '../../data'
import classes from './style.module.css'
import { IoMenuOutline as MenuIcon } from 'react-icons/io5'
import { AuthContext } from '../../context/AuthContext'

//fechar submenu quando clicar em um item que na

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { logout } = useContext(AuthContext)

    const navigate = useNavigate()

    const [openMenu, setOpenMenu] = useState(null)

    const toggleSubMenu = (linkName) => {
        setOpenMenu(openMenu === linkName ? null : linkName)
    }

    const closeSubMenu = () => {
        setOpenMenu(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const user = await logout() // Chame a função logout corretamente
        if (user) {
            closeSidebar() // Execute a função closeSidebar corretamente
            navigate('/')
        } else {
            alert('Logout failed')
        }
    }

    return (
        <div className={`${classes.sidebar} ${isOpen && classes.open}`}>
            <span className={classes.closeIcon} onClick={closeSidebar}>
                <MenuIcon size={30} />
            </span>
            {/* Links */}
            <div className={classes.links}>
                {LINKS.map(link => (
                    <div key={link.name} className={classes.menuItem}>
                        {/* Link Principal - Exibido como botão se contiver sublinks */}
                        {link.sublinks ? (
                            <NavLink
                                className={openMenu === link.name ? classes.activeMenu : ''}
                                onClick={() => toggleSubMenu(link.name)}
                            >
                                {link.name}
                                {/* Triângulo indicando submenu */}
                                <span className={`${classes.triangle} ${openMenu === link.name ? classes.open : ''}`}></span>
                            </NavLink>
                        ) : (
                            <NavLink
                                to={link.to}
                                className={({ isActive }) => (isActive ? classes.activeLink : '')}
                                onClick={() => {
                                    closeSidebar()
                                    closeSubMenu()
                                }}
                            >
                                {link.name}
                            </NavLink>
                        )}

                        {/* Sublinks (se houver e estiver aberto) */}
                        {link.sublinks && openMenu === link.name && (
                            <div className={classes.sublinksContainer}>
                                {link.sublinks.map(sublink => (
                                    <NavLink
                                        key={sublink.name}
                                        to={sublink.to}
                                        className={({ isActive }) => 
                                            `${classes.sublink} ${isActive ? classes.activeSubLink : ''}`
                                        }
                                        onClick={closeSidebar}
                                    >
                                        {sublink.name}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {/* Auth Links */}
            <div className={classes.authContext}>
                <button onClick={handleSubmit} className={classes.login}>Sair</button>
            </div>
        </div>
    )
}

export default Sidebar