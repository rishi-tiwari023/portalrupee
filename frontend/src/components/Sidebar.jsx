import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  CreditCard,
  LayoutDashboard,
  ArrowLeftRight,
  History,
  Settings,
  LogOut,
  User,
  Users
} from 'lucide-react';
import logo from '../assets/logo.png';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', end: true },
    { name: 'Profile', icon: User, path: '/dashboard/profile' },
    { name: 'Accounts', icon: CreditCard, path: '/dashboard/accounts' },
    { name: 'Transfer', icon: ArrowLeftRight, path: '/dashboard/transfer' },
    { name: 'Transactions', icon: History, path: '/dashboard/transactions' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  // Add Manager-specific links
  if (user?.role === 'MANAGER') {
    menuItems.push({ name: 'User Management', icon: Users, path: '/dashboard/users' });
  }

  return (
    <aside
      className={`
        ${isExpanded ? 'w-64' : 'w-20'} 
        bg-white h-full flex flex-col border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        transition-all duration-300 ease-in-out relative z-20
      `}
    >
      {/* PortalRupee Info */}
      <div className="h-16 flex items-center px-6 border-b border-slate-50 mb-6 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="w-9 h-9 flex-shrink-0 mr-3 overflow-hidden rounded-lg shadow-sm">
          <img src={logo} alt="PortalRupee Logo" className="w-full h-full object-contain" />
        </div>
        {isExpanded && (
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent truncate tracking-tight transition-opacity duration-300">
            PortalRupee
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `
                flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive
                  ? 'bg-indigo-50/80 text-indigo-600 font-bold shadow-sm border border-indigo-200 ring-4 ring-indigo-500/10'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 
                      ${isActive ? 'text-indigo-600' : 'group-hover:scale-110 text-slate-400 group-hover:text-indigo-500'}
                      ${isExpanded ? 'mr-3' : 'mx-auto'}
                    `}
                  />
                  {isExpanded && <span className="truncate whitespace-nowrap">{item.name}</span>}

                  {!isActive && isExpanded && (
                    <span className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300 scale-95 group-hover:scale-100 -z-10" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 mt-auto border-t border-slate-50">
        <button 
          onClick={() => dispatch(logout())}
          className="flex items-center w-full px-3 py-3 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors duration-200 rounded-xl group"
        >
          <LogOut className={`w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 duration-200 ${isExpanded ? 'mr-3' : 'mx-auto'}`} />
          {isExpanded && <span className="font-medium truncate">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
