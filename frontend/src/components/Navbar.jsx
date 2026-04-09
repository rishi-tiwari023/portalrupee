import { useState } from 'react';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="navbar-logo">
                    <img src={logo} alt="PortalRupee Logo" className="navbar-logo-img" />
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

