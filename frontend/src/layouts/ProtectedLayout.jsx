import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { Bell, Search, Menu, Check, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, MessageSquare } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

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

const ProtectedLayout = () => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    if (user?.profileImageKey) {
      import('../api/axios').then(({ default: api }) => {
         api.get(`/uploads/url/${user.profileImageKey}`)
            .then(res => setProfileImageUrl(res.data.url))
            .catch(err => console.error(err));
      });
    }
  }, [user?.profileImageKey]);

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setShowNotifications(false);
    if (notif.type === 'MESSAGE') {
      navigate('/dashboard/messages');
    } else if (['DEPOSIT', 'WITHDRAW', 'TRANSFER'].includes(notif.type)) {
      navigate('/dashboard/transactions');
    }
  };
  
  const { 
    isConnected, 
    notifications = [], 
    unreadCount = 0, 
    markAllAsRead, 
    markAsRead 
  } = useSocket() || {};

  useEffect(() => {
    if (user && user.twoFactorEnabled === false) {
      const hasSeenPrompt = sessionStorage.getItem('2fa_prompt_seen');
      if (!hasSeenPrompt) {
        toast.warn('Security Alert: Please enable Two-Factor Authentication to secure your account!', {
          autoClose: 10000,
          className: 'premium-toast',
        });
        sessionStorage.setItem('2fa_prompt_seen', 'true');
      }
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect pending users to the Approval Required page
  if (user?.approvalStatus === 'PENDING') {
    return <Navigate to="/approval-required" replace />;
  }

  // Redirect completely frozen users if they try to access restricted pages
  if (
    user?.isCompletelyFrozen &&
    !location.pathname.startsWith('/dashboard/frozen') &&
    location.pathname !== '/dashboard/profile' &&
    location.pathname !== '/dashboard/settings'
  ) {
    return <Navigate to="/dashboard/frozen" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-[#fcfdfe] dark:bg-slate-950 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
      <Sidebar isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} />
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative no-scrollbar">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[100px]" />
        </div>

        {/* Top Header */}
        <header className="flex-shrink-0 w-full h-16 lg:h-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 lg:px-10 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
           <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 transition-all"
             >
               <Menu className="w-6 h-6" />
             </button>
          </div>

          <div className="flex items-center gap-6">
            {/* Connection Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/50 border border-white/50">
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
              <span className="text-xs font-bold text-slate-600">{isConnected ? 'Online' : 'Connecting...'}</span>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-xl border transition-all group ${
                  showNotifications 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                    : 'bg-white border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5'
                }`}
              >
                <Bell className={`w-5 h-5 ${!showNotifications ? 'group-hover:shake' : ''}`} />
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
                        className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden p-2 z-[200] flex flex-col max-h-[400px]"
                    >
                        <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Notifications</span>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
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
                                        className={`flex gap-3 p-3 rounded-2xl cursor-pointer transition-colors border border-transparent ${
                                            notif.read 
                                                ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400' 
                                                : 'bg-indigo-50/20 dark:bg-indigo-900/30 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/60 border-indigo-100/30 dark:border-indigo-800/30 text-slate-800 dark:text-slate-200'
                                        }`}
                                    >
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            notif.type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-600' : 
                                            notif.type === 'WITHDRAW' ? 'bg-rose-50 text-rose-600' : 
                                            notif.type === 'TRANSFER' ? 'bg-indigo-50 text-indigo-600' : 
                                            notif.type === 'MESSAGE' ? 'bg-sky-50 text-sky-600' : ''
                                        }`}>
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

            <div className="h-8 w-[1px] bg-slate-200/60" />

            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="flex flex-col text-right">
                <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{user?.role || 'CUSTOMER'}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 p-[3px] shadow-lg shadow-indigo-200 transform group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-[13px] bg-white flex items-center justify-center text-indigo-700 font-black text-sm overflow-hidden">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <>{user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase() || ''}</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 p-6 lg:p-10 pt-8 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProtectedLayout;
