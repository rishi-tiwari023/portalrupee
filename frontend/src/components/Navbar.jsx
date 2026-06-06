import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import logo from '../assets/logo.png';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, Layout, CreditCard, LogOut, UserPlus, LogIn } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        dispatch(logoutUser());
        setShowDropdown(false);
    };

    // Outside click detection
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
                setShowCreateDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    return (
        <nav className="navbar fixed top-0 left-0 right-0 z-[100] backdrop-blur-md bg-white/80 border-b border-slate-100">
            <div className="navbar-container max-w-7xl mx-auto flex justify-between items-center w-full px-4 md:px-8">
                <div className="navbar-left">
                    <Link to="/" className="navbar-logo-link flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
                        <div className="navbar-logo w-10 h-10 shadow-sm rounded-xl overflow-hidden">
                            <img src={logo} alt="PortalRupee Logo" className="w-full h-full object-contain p-1" />
                        </div>
                        <h1 className="navbar-title text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
                            Portal Rupee
                        </h1>
                    </Link>
                </div>

                <div className="navbar-right" ref={dropdownRef}>
                    <div className="dropdown-container relative">
                        <button 
                            onClick={toggleDropdown}
                            className={`dropdown-toggle flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all shadow-sm
                                ${showDropdown 
                                    ? 'bg-indigo-600 text-white shadow-indigo-100 scale-105' 
                                    : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md active:scale-95'
                                }
                            `}
                        >
                            <span>{isAuthenticated ? (user?.firstName || 'Account') : 'StepUp'}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showDropdown && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="dropdown-menu absolute right-0 mt-3 w-64 bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden p-2 z-[200]"
                                >
                                    {isAuthenticated ? (
                                        <div className="p-1 space-y-1">
                                            <Link to="/dashboard" onClick={() => setShowDropdown(false)} className="dropdown-item flex items-center gap-3 p-3 rounded-2xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold transition-colors">
                                                <Layout size={18} className="text-indigo-500" />
                                                <span>Dashboard</span>
                                            </Link>
                                            <Link to="/dashboard/accounts" onClick={() => setShowDropdown(false)} className="dropdown-item flex items-center gap-3 p-3 rounded-2xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold transition-colors">
                                                <CreditCard size={18} className="text-indigo-500" />
                                                <span>My Accounts</span>
                                            </Link>
                                            <div className="h-px bg-slate-50 my-1 mx-2" />
                                            <button onClick={handleLogout} className="dropdown-item w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 text-red-500 font-semibold transition-colors">
                                                <LogOut size={18} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-1 space-y-1">
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                                                    className={`dropdown-item w-full flex items-center justify-between p-3 rounded-2xl font-semibold transition-colors
                                                        ${showCreateDropdown ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <UserPlus size={18} className="text-indigo-500" />
                                                        <span>Create</span>
                                                    </div>
                                                    <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${showCreateDropdown ? '-rotate-90' : ''}`} />
                                                </button>
                                                
                                                <AnimatePresence>
                                                    {showCreateDropdown && (
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="ml-8 overflow-hidden"
                                                        >
                                                            <div className="py-1 space-y-1">
                                                                <Link to="/register" onClick={() => setShowDropdown(false)} className="block p-2 text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                                                                    Savings Account
                                                                </Link>
                                                                <Link to="/register" onClick={() => setShowDropdown(false)} className="block p-2 text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                                                                    Current Account
                                                                </Link>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            
                                            <Link to="/login" onClick={() => setShowDropdown(false)} className="dropdown-item flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                                                <LogIn size={18} className="text-slate-400" />
                                                <span>Login</span>
                                            </Link>
                                            <Link to="/register" onClick={() => setShowDropdown(false)} className="dropdown-item flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                                                <UserPlus size={18} className="text-slate-400" />
                                                <span>Register</span>
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

