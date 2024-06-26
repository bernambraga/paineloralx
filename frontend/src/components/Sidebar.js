// src/components/Sidebar.js
import React from 'react';

function Sidebar({ isOpen }) {
    return (
        <div className={`sidebar ${isOpen? 'open' : ''}`}>
            <ul>
                <li>Menu Item 1</li>
                <li>Menu Item 2</li>
                <li>Menu Item 3</li>
            </ul>
        </div>
    );
}

export default Sidebar;