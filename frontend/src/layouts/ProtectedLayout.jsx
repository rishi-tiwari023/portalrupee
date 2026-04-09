import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const ProtectedLayout = () => {
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <div className="w-full absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white pointer-events-none" />

        <header className="w-full h-16 bg-white/70 glass sticky top-0 z-10 flex items-center justify-end px-8">
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800">John Doe</span>
              <span className="text-xs text-indigo-500 font-medium">Customer</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[2px]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold">
                JD
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 pb-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProtectedLayout;
