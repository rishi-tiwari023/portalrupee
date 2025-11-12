import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="navbar-logo">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="#646cff" />
                        <text x="20" y="26" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">P</text>
                    </svg>
                </div>
                <h1 className="navbar-title">Portal Rupee</h1>
            </div>
            <div className="navbar-right">
                <div
                    className="dropdown-container"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    <button className="dropdown-toggle">
                        StepUp
                        <span className="dropdown-arrow">▼</span>
                    </button>
                    {showDropdown && (
                        <div className="dropdown-menu">
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
                                        <button className="nested-dropdown-item">Savings Account</button>
                                        <button className="nested-dropdown-item">Current Account</button>
                                    </div>
                                )}
                            </div>
                            <button className="dropdown-item">Login</button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

