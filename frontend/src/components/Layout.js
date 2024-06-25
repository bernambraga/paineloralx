import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children, user, onLogout }) => {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <span>Welcome, {user.username}</span>
          <nav className="nav-links">
            <Link to="/home" className="nav-link">Home</Link>
            <Link to="/settings" className="nav-link">Settings</Link>
            <button onClick={onLogout} className="nav-button">Logout</button>
          </nav>
        </div>
      </header>
      <div className="container">
        <aside className="sidebar">
          <nav>
            <Link to="/page1" className="sidebar-link">Page 1</Link>
            <Link to="/page2" className="sidebar-link">Page 2</Link>
            {/* Adicione mais links conforme necessário */}
          </nav>
        </aside>
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
