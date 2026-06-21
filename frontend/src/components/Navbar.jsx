import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import logo from '../assets/logo.png';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDown, 
    ChevronLeft, 
    Layout, 
    CreditCard, 
    LogOut, 
    UserPlus, 
    LogIn, 
    Bell, 
    ArrowDownLeft, 
    ArrowUpRight, 
    ArrowLeftRight, 
    MessageSquare, 
    Check,
    LayoutDashboard,
    History,
    Settings,
    User,
    Users,
    TrendingUp,
    ShieldAlert,
    Menu
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import './Navbar.css';

const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getNotificationIcon = (type) => {
    switch (type) {
        case 'DEPOSIT':
            return <ArrowDownLeft className="w-4 h-4" />;
        case 'WITHDRAW':
            return <ArrowUpRight className="w-4 h-4" />;
        case 'TRANSFER':
            return <ArrowLeftRight className="w-4 h-4" />;
        case 'MESSAGE':
            return <MessageSquare className="w-4 h-4" />;
        default:
            return <Bell className="w-4 h-4" />;
    }
};

const Navbar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { 
        notifications = [], 
        unreadCount = 0, 
        markAllAsRead, 
        markAsRead 
    } = useSocket() || {};
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const [showDashboardMenu, setShowDashboardMenu] = useState(false);

    let menuItems = [];
    if (user?.role === 'ADMIN') {
        menuItems = [
            { name: 'Profile', icon: User, path: '/dashboard/profile' },
            { name: 'Pending Approvals', icon: Users, path: '/dashboard/pending-approvals' },
            { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
        ];
    } else if (user?.role === 'CASHIER') {
        menuItems = [
            { name: 'Profile', icon: User, path: '/dashboard/profile' },
            { name: 'Approve Deposits', icon: CreditCard, path: '/dashboard/approve-deposits' },
            { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
        ];
    } else if (user?.role === 'MANAGER') {
        menuItems = [
            { name: 'Profile', icon: User, path: '/dashboard/profile' },
            { name: 'Pending Approvals', icon: Users, path: '/dashboard/pending-approvals' },
            { name: 'User Management', icon: Users, path: '/dashboard/users' },
            { name: 'Freeze Accounts', icon: CreditCard, path: '/dashboard/freeze-accounts' },
            { name: 'Freeze Disputes', icon: ShieldAlert, path: '/dashboard/freeze-disputes' },
            { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
        ];
    } else if (user) {
        if (user?.isCompletelyFrozen) {
            menuItems = [
                { name: 'Account Status', icon: ShieldAlert, path: '/dashboard/frozen' },
                { name: 'Profile', icon: User, path: '/dashboard/profile' },
                { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
            ];
        } else {
            menuItems = [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
                { name: 'Profile', icon: User, path: '/dashboard/profile' },
                { name: 'Accounts', icon: CreditCard, path: '/dashboard/accounts' },
                { name: 'Analytics', icon: TrendingUp, path: '/dashboard/analytics' },
                { name: 'Transfer', icon: ArrowLeftRight, path: '/dashboard/transfer' },
                { name: 'Transactions', icon: History, path: '/dashboard/transactions' },
                { name: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
            ];
            if (user?.isPartiallyFrozen) {
                menuItems.push({ name: 'Account Status', icon: ShieldAlert, path: '/dashboard/frozen' });
            }
            menuItems.push({ name: 'Settings', icon: Settings, path: '/dashboard/settings' });
        }
    }

    const handleNotificationClick = (notif) => {
        markAsRead(notif.id);
        setShowNotifications(false);
        if (notif.type === 'MESSAGE') {
            navigate('/dashboard/messages');
        } else if (['DEPOSIT', 'WITHDRAW', 'TRANSFER'].includes(notif.type)) {
            navigate('/dashboard/transactions');
        }
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        setShowDropdown(false);
        setShowNotifications(false);
    };

    // Outside click detection
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
                setShowCreateDropdown(false);
                setShowNotifications(false);
                setShowDashboardMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        setShowNotifications(false);
        setShowDashboardMenu(false);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        setShowDropdown(false);
        setShowCreateDropdown(false);
        setShowDashboardMenu(false);
    };

    const toggleDashboardMenu = () => {
        setShowDashboardMenu(!showDashboardMenu);
        setShowDropdown(false);
        setShowNotifications(false);
        setShowCreateDropdown(false);
    };

    return (
        <nav className="navbar fixed top-0 left-0 right-0 z-[100] backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
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

                <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
                    <Link to="/about" className="hover:text-indigo-600 transition-colors">What is PortalRupee</Link>
                    <Link to="/guidelines" className="hover:text-indigo-600 transition-colors">Guidelines</Link>
                    <Link to="/interest-info" className="hover:text-indigo-600 transition-colors">Interest Information</Link>
                    <Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms & Conditions</Link>
                    <Link to="/contact" className="hover:text-indigo-600 transition-colors">Contact Us</Link>
                    <Link to="/demo-credentials" className="hover:text-indigo-600 transition-colors">Demo Credentials</Link>
                </div>

                <div className="navbar-right flex items-center gap-3 md:gap-4" ref={dropdownRef}>
                    {isAuthenticated && (
                        <div className="notification-container relative">
                            <button 
                                onClick={toggleNotifications}
                                className={`relative p-2.5 rounded-2xl border transition-all active:scale-95 cursor-pointer
                                    ${showNotifications 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md'
                                    }
                                `}
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border border-white px-1">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="dropdown-menu absolute -right-10 sm:right-0 mt-3 w-[90vw] sm:w-80 max-w-[320px] bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden p-2 z-[200] flex flex-col max-h-[400px]"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                                            <span className="text-sm font-extrabold text-slate-800">Notifications</span>
                                            {unreadCount > 0 && (
                                                <button 
                                                    onClick={markAllAsRead}
                                                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-1 max-h-[300px]">
                                            {notifications.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                                                    <Bell className="w-8 h-8 text-slate-200 mb-2" />
                                                    <p className="text-xs font-semibold">No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div 
                                                        key={notif.id}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`flex gap-3 p-3 rounded-2xl cursor-pointer transition-colors border border-transparent
                                                            ${notif.read 
                                                                ? 'hover:bg-slate-50 text-slate-600' 
                                                                : 'bg-indigo-50/20 hover:bg-indigo-50/40 border-indigo-100/30 text-slate-800'
                                                            }
                                                        `}
                                                    >
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                                                            ${notif.type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-600' : ''}
                                                            ${notif.type === 'WITHDRAW' ? 'bg-rose-50 text-rose-600' : ''}
                                                            ${notif.type === 'TRANSFER' ? 'bg-indigo-50 text-indigo-600' : ''}
                                                            ${notif.type === 'MESSAGE' ? 'bg-sky-50 text-sky-600' : ''}
                                                        `}>
                                                            {getNotificationIcon(notif.type)}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold leading-normal break-words">
                                                                {notif.message}
                                                            </p>
                                                            <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                                                                {formatTime(notif.createdAt)}
                                                            </span>
                                                        </div>
                                                        {!notif.read && (
                                                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-2 flex-shrink-0 shadow-sm" />
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    <div className="md:hidden relative">
                        <button 
                            onClick={toggleDashboardMenu}
                            className={`relative p-2.5 rounded-2xl border transition-all active:scale-95 cursor-pointer
                                ${showDashboardMenu 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md'
                                }
                            `}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                            {showDashboardMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="dropdown-menu fixed left-4 right-4 mx-auto sm:left-auto sm:mx-0 top-[72px] w-auto max-w-[320px] bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden p-2 z-[200] flex flex-col max-h-[80vh]"
                                >
                                    <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                                        <span className="text-sm font-extrabold text-slate-800">Menu</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-1">
                                        {isAuthenticated && menuItems.length > 0 && (
                                            <>
                                                <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">Dashboard</div>
                                                {menuItems.map((item, idx) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <Link 
                                                            key={idx} 
                                                            to={item.path} 
                                                            onClick={() => setShowDashboardMenu(false)}
                                                            className="flex items-center gap-3 p-3 mx-1 rounded-2xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold transition-colors"
                                                        >
                                                            <Icon size={18} className="text-indigo-500" />
                                                            <span>{item.name}</span>
                                                        </Link>
                                                    );
                                                })}
                                                <div className="h-px bg-slate-50 my-2 mx-2" />
                                            </>
                                        )}
                                        
                                        <div className="px-3 py-1 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Information</div>
                                        <Link to="/about" onClick={() => setShowDashboardMenu(false)} className="block p-3 mx-1 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors">What is PortalRupee</Link>
                                        <Link to="/guidelines" onClick={() => setShowDashboardMenu(false)} className="block p-3 mx-1 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors">Guidelines</Link>
                                        <Link to="/interest-info" onClick={() => setShowDashboardMenu(false)} className="block p-3 mx-1 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors">Interest Information</Link>
                                        <Link to="/terms" onClick={() => setShowDashboardMenu(false)} className="block p-3 mx-1 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors">Terms & Conditions</Link>
                                        <Link to="/contact" onClick={() => setShowDashboardMenu(false)} className="block p-3 mx-1 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors">Contact Us</Link>
                                        <Link to="/demo-credentials" onClick={() => setShowDashboardMenu(false)} className="block p-3 mx-1 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors">Demo Credentials</Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

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
                                            <Link to="/dashboard" onClick={() => setShowDropdown(false)} className="hidden md:flex dropdown-item items-center gap-3 p-3 rounded-2xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold transition-colors">
                                                <Layout size={18} className="text-indigo-500" />
                                                <span>Dashboard</span>
                                            </Link>
                                            <Link to="/dashboard/accounts" onClick={() => setShowDropdown(false)} className="hidden md:flex dropdown-item items-center gap-3 p-3 rounded-2xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold transition-colors">
                                                <CreditCard size={18} className="text-indigo-500" />
                                                <span>My Accounts</span>
                                            </Link>
                                            <div className="h-px bg-slate-50 my-1 mx-2 hidden md:block" />
                                            <button onClick={handleLogout} className="dropdown-item w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 text-red-500 font-semibold transition-colors">
                                                <LogOut size={18} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-1 space-y-1">
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

