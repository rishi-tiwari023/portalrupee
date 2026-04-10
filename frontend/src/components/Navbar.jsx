import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-logo-link flex items-center gap-3">
                    <div className="navbar-logo">
                        <img src={logo} alt="PortalRupee Logo" className="navbar-logo-img" />
                    </div>
                    <h1 className="navbar-title">Portal Rupee</h1>
                </Link>
            </div>
            <div className="navbar-right">
                <div
                    className="dropdown-container"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    <button className="dropdown-toggle">
                        {isAuthenticated ? (user?.firstName || 'Account') : 'StepUp'}
                        <span className="dropdown-arrow">▼</span>
                    </button>
                    {showDropdown && (
                        <div className="dropdown-menu">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/dashboard" className="dropdown-item">Dashboard</Link>
                                    <Link to="/dashboard/accounts" className="dropdown-item">My Accounts</Link>
                                    <button onClick={handleLogout} className="dropdown-item text-red-500">Logout</button>
                                </>
                            ) : (
                                <>
                                    <div
                                        className="nested-container"
                                        onMouseEnter={() => setShowCreateDropdown(true)}
                                        onMouseLeave={() => setShowCreateDropdown(false)}
                                    >
                                        <div className="dropdown-item has-nested">
                                            <span>Create</span>
                                            <span className="nested-arrow">◀</span>
                                        </div>
                                        {showCreateDropdown && (
                                            <div className="nested-dropdown">
                                                <Link to="/register" className="nested-dropdown-item">Savings Account</Link>
                                                <Link to="/register" className="nested-dropdown-item">Current Account</Link>
                                            </div>
                                        )}
                                    </div>
                                    <Link to="/login" className="dropdown-item">Login</Link>
                                    <Link to="/register" className="dropdown-item">Register</Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

