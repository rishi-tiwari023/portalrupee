import React from 'react';
import { useSelector } from 'react-redux';

const DashboardHome = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="w-full animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
            Welcome back, <span className="text-indigo-600">{user?.firstName || 'User'}</span>
        </h1>
        <p className="text-slate-500 font-medium">Here's what's happening with your accounts today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="premium-card p-6 border-l-4 border-l-indigo-500 bg-white shadow-sm ring-1 ring-slate-200/50 rounded-2xl">
          <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">Total Balance</h3>
          <p className="text-4xl font-bold bg-gradient-to-br from-indigo-700 to-indigo-400 bg-clip-text text-transparent">₹4,500.00</p>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-emerald-500 bg-white shadow-sm ring-1 ring-slate-200/50 rounded-2xl flex flex-col justify-between">
          <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">Active Accounts</h3>
          <p className="text-3xl font-bold text-slate-800">1 Account</p>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-amber-500 bg-white shadow-sm ring-1 ring-slate-200/50 rounded-2xl flex flex-col justify-between">
          <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">Recent Transactions</h3>
          <p className="text-3xl font-bold text-slate-800">24 This Month</p>
        </div>
      </div>

      <div className="premium-card p-8 min-h-[400px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-md border border-white rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        </div>
        <p className="text-slate-400 font-medium text-lg">Transaction Analytics Coming Soon</p>
        <p className="text-slate-300 text-sm max-w-xs text-center mt-2">We are working on bringing you advanced spending patterns and insights.</p>
      </div>
    </div>
  );
};

export default DashboardHome;
