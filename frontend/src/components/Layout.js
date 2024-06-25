import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children, user, onLogout }) => {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <span>Welcome, {user.username}</span>
          <nav>
            <Link to="/home">Home</Link>
            <Link to="/settings">Settings</Link>
            <button onClick={onLogout}>Logout</button>
          </nav>
        </div>
      </header>
      <div className="container">
        <aside className="sidebar">
          <nav>
            <Link to="/page1">Page 1</Link>
            <Link to="/page2">Page 2</Link>
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
