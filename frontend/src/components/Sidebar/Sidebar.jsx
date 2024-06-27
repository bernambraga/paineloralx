import { NavLink } from 'react-router-dom'
import { LINKS } from '../../data'
import classes from './style.module.css'
import {IoClose as CloseIcon} from 'react-icons/io5'


const Sidebar = ({isOpen, closeSidebar}) => {
  return (
    <div className={`${classes.sidebar} ${isOpen && classes.open}`}>
        <span className={classes.closeIcon} onClick={closeSidebar}>
            <CloseIcon size={30}/>
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
            <NavLink 
                to='/login' 
                className={({ isActive }) => 
                    `${classes.login} ${isActive ? classes.activeLink : ''}`
                }
                onClick={closeSidebar}
            >
                Login
            </NavLink>
        </div>
    </div>
  )
}

export default Sidebar