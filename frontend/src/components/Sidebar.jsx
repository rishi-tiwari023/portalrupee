import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  CreditCard,
  LayoutDashboard,
  ArrowLeftRight,
  History,
  Settings,
  LogOut,
  User,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import logo from '../assets/logo.png';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', end: true },
    { name: 'Profile', icon: User, path: '/dashboard/profile' },
    { name: 'Accounts', icon: CreditCard, path: '/dashboard/accounts' },
    { name: 'Transfer', icon: ArrowLeftRight, path: '/dashboard/transfer' },
    { name: 'Transactions', icon: History, path: '/dashboard/transactions' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  if (user?.role === 'MANAGER') {
    menuItems.push({ name: 'User Management', icon: Users, path: '/dashboard/users' });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-500 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0
          ${isExpanded ? 'w-72' : 'w-24'} 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-white h-full flex flex-col border-r border-slate-100 shadow-[20px_0_40px_rgba(0,0,0,0.01)]
          transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        `}
      >
      {/* PortalRupee Info */}
      <div className="h-32 pt-4 flex items-center px-6 mb-8 relative">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 flex-shrink-0 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <img src={logo} alt="L" className="w-6 h-6 object-contain invert" />
          </div>
          {isExpanded && (
            <span className="text-xl font-black text-slate-900 tracking-tighter transition-all duration-500">
              Portal<span className="text-indigo-600">Rupee</span>
            </span>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all text-slate-400 hover:text-indigo-600"
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.end
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              onClick={() => setIsMobileOpen(false)}
              className={`
                flex items-center px-4 py-3.5 rounded-2xl transition-all duration-50 group relative
                ${isActive
                  ? 'bg-indigo-50/80 text-indigo-600 font-bold shadow-sm border border-indigo-200 ring-4 ring-indigo-500/10'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }
              `}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-all duration-50 
                  ${isActive ? 'text-indigo-600 scale-110' : 'text-slate-400 group-hover:scale-110 group-hover:text-indigo-500'}
                  ${isExpanded ? 'mr-4' : 'mx-auto'}
                `}
              />
              {isExpanded && <span className="truncate whitespace-nowrap tracking-wide">{item.name}</span>}

              {!isExpanded && !isActive && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Quick Switcher or Log Out */}
      <div className="p-4 mt-auto border-t border-slate-50">
        <button
          onClick={() => dispatch(logout())}
          className={`
            flex items-center w-full px-4 py-3.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 rounded-2xl group
            ${!isExpanded ? 'justify-center' : ''}
          `}
        >
          <LogOut className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-1 ${isExpanded ? 'mr-4' : ''}`} />
          {isExpanded && <span className="font-bold tracking-wide">Sign Out</span>}
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
