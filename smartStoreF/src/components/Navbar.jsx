import React from "react";
function Navbar() {
    return (
        <nav className="navbar bg-gray-800 text-white p-4 flex justify-between items-center">
            <h1>Smart Store</h1>
            <ul className="nav-links flex space-x-4">
                <li><a href="/">Home</a></li>
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/profile">Profile</a></li>
                <li><a href="/settings">Settings</a></li>
            </ul>
        </nav>
    );
}

export default Navbar;
