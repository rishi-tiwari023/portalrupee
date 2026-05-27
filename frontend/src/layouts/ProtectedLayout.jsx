import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { Bell, Search, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ProtectedLayout = () => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <div className="flex h-screen w-full bg-[#fcfdfe] overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} />
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative no-scrollbar">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[100px]" />
        </div>

        {/* Top Header */}
        <header className="w-full h-24 lg:h-32 bg-white/60 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between px-6 lg:px-10 border-b border-white/40">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 transition-all"
             >
               <Menu className="w-6 h-6" />
             </button>
             
             <div className="hidden md:flex items-center gap-4 bg-slate-100/50 px-4 py-2 rounded-2xl border border-white/50 w-full max-w-md group focus-within:bg-white focus-within:shadow-lg focus-within:shadow-indigo-500/5 transition-all duration-300">
               <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
               <input
                 type="text"
                 placeholder="Search transactions..."
                 className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 placeholder:text-slate-400 w-full"
               />
             </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group">
              <Bell className="w-5 h-5 group-hover:shake" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <div className="h-8 w-[1px] bg-slate-200/60" />

            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="flex flex-col text-right">
                <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{user?.role || 'CUSTOMER'}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 p-[3px] shadow-lg shadow-indigo-200 transform group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-[13px] bg-white flex items-center justify-center text-indigo-700 font-black text-sm">
                  {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase() || ''}
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
