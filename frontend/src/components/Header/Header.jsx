import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/bamulogo.png';

export default function Header({ user, setUser, loading }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    // 2. Logout function
    const handleLogout = async () => {
        try {
            await fetch("/api/v1/logout/", {
                method: "POST",
                credentials: "include",
            });
            setUser(null); // Instantly switches UI to show "Login" button
            setOpen(false);
            // navigate to login instead of full reload if state is managed correctly
            navigate("/login");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <header className="shadow sticky z-50 top-0 bg-white">
            <nav className="border-gray-200 px-4 lg:px-6 py-2.5">
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">

                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center">
                        <img src={logoImg} className="mr-3 h-10" alt="Logo" />
                    </Link>

                    {/* Authentication Section */}
                    <div className="flex items-center lg:order-2">
                        {loading ? (
                            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                        ) : !user ? (
                            /* IF LOGGED OUT: Show Login Link */
                            <Link
                                to="/login"
                                className="text-white bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none transition-colors"
                            >
                                Log in
                            </Link>
                        ) : (
                            /* IF LOGGED IN: Show Profile Avatar (Login page is now hidden) */
                            <div className="relative">
                                {(() => {
                                    const displayName = user.name || user.username;
                                    const firstLetter = displayName?.charAt(0).toUpperCase() || "U";
                                    return (
                                        <button
                                            onClick={() => setOpen(!open)}
                                            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-md hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        >
                                            {firstLetter}
                                        </button>
                                    );
                                })()}

                                {open && (
                                    <>
                                        {/* Click outside to close */}
                                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}></div>

                                        <div className="absolute right-0 mt-3 bg-white p-4 rounded-lg shadow-xl border border-gray-100 w-52 z-20">
                                            <div className="mb-3 border-b pb-2">
                                                <p className="text-sm font-bold text-gray-800 truncate">{user.name || user.username}</p>
                                                <p className="text-xs text-gray-500">{user.role || '-'}</p>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full bg-red-600 text-white py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Main Navigation */}
                    <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1">
                        <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                            <li>
                                <NavLink to="/" className={({ isActive }) =>
                                    `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700 font-bold" : "text-gray-700"} hover:text-orange-700 lg:p-0`
                                }>
                                    Home
                                </NavLink>
                            </li>
                            {user && (
                                <>
                                    {(user.isAdmin || user.role?.toLowerCase() === "store manager" || user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "staff member") && (
                                        <li>
                                            <NavLink to="/product" className={({ isActive }) =>
                                                `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700 font-bold" : "text-gray-700"} hover:text-orange-700 lg:p-0`
                                            }>
                                                Products
                                            </NavLink>
                                        </li>
                                    )}

                                    {(user.isAdmin || user.role?.toLowerCase() === "store manager" || user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "staff member") && (
                                        <>
                                            <li>
                                                <NavLink to="/scan" className={({ isActive }) =>
                                                    `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700 font-bold" : "text-gray-700"} hover:text-orange-700 lg:p-0`
                                                }>
                                                    Scan
                                                </NavLink>
                                            </li>

                                            <li>
                                                <NavLink to="/cart" className={({ isActive }) =>
                                                    `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700 font-bold" : "text-gray-700"} hover:text-orange-700 lg:p-0`
                                                }>
                                                    Cart
                                                </NavLink>
                                            </li>
                                        </>
                                    )}
                                    {user.isAdmin && user.role?.toLowerCase() !== "store manager" && (
                                        <li>
                                            <NavLink to="/staff" className={({ isActive }) =>
                                                `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700 font-bold" : "text-gray-700"} hover:text-orange-700 lg:p-0`
                                            }>
                                                Staff
                                            </NavLink>
                                        </li>
                                    )}
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}