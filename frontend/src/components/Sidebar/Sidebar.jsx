import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LINKS } from "../../data";
import classes from "./style.module.css";
import { IoMenuOutline as MenuIcon } from "react-icons/io5";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleSubMenu = (linkName) => {
    setOpenMenu(openMenu === linkName ? null : linkName);
  };

  const closeSubMenu = () => {
    setOpenMenu(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await logout();
    if (user) {
      closeSidebar();
      navigate("/");
    } else {
      alert("Logout failed");
    }
  };

  const hasPermission = (allowedGroups) => {
    if (!allowedGroups || allowedGroups.length === 0) return true;
    if (!user || !user.groups) return false;
    return user.groups.some((group) => allowedGroups.includes(group));
  };

  return (
    <div className={`${classes.sidebar} ${isOpen && classes.open}`}>
      <span className={classes.closeIcon} onClick={closeSidebar}>
        <MenuIcon size={30} />
      </span>

      <div className={classes.links}>
        {LINKS.map((link) => {
          if (!hasPermission(link.allowedGroups)) return null;

          return (
            <div key={link.name} className={classes.menuItem}>
              {link.sublinks ? (
                <NavLink
                  className={openMenu === link.name ? classes.activeMenu : ""}
                  onClick={() => toggleSubMenu(link.name)}
                >
                  {link.name}
                  <span
                    className={`${classes.triangle} ${
                      openMenu === link.name ? classes.open : ""
                    }`}
                  ></span>
                </NavLink>
              ) : (
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    isActive ? classes.activeLink : ""
                  }
                  onClick={() => {
                    closeSidebar();
                    closeSubMenu();
                  }}
                >
                  {link.name}
                </NavLink>
              )}

              {link.sublinks && openMenu === link.name && (
                <div className={classes.sublinksContainer}>
                  {link.sublinks.map((sublink) => {
                    if (!hasPermission(sublink.allowedGroups)) return null;

                    return (
                      <NavLink
                        key={sublink.name}
                        to={sublink.to}
                        className={({ isActive }) =>
                          `${classes.sublink} ${
                            isActive ? classes.activeSubLink : ""
                          }`
                        }
                        onClick={closeSidebar}
                      >
                        {sublink.name}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={classes.authContext}>
        <button onClick={handleSubmit} className={classes.login}>
          Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
