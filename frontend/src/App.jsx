import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import ProtectedLayout from './layouts/ProtectedLayout';
import EMICalculator from './components/EMICalculator';
import RBIGuideline from './components/RBIGuideline';

import './App.css';

const Home = () => (
  <div className="flex flex-col gap-12 w-full max-w-7xl mx-auto p-6 md:p-12">
    <div className="text-center py-10">
      <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
        Welcome to <span className="text-gradient">PortalRupee</span>
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        Experience premium banking with dynamic tools, lightning-fast transactions, and rock-solid security.
      </p>
    </div>
    <EMICalculator />
    <RBIGuideline />
  </div>
);

const DashboardHome = () => (
  <div className="w-full">
    <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard Summary</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="premium-card p-6 border-l-4 border-l-indigo-500">
        <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">Total Balance</h3>
        <p className="text-4xl font-bold bg-gradient-to-br from-indigo-700 to-indigo-400 bg-clip-text text-transparent">₹2,45,000</p>
      </div>
      <div className="premium-card p-6 border-l-4 border-l-emerald-500 flex flex-col justify-between">
        <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">Active Accounts</h3>
        <p className="text-3xl font-bold text-slate-800">2 Accounts</p>
      </div>
      <div className="premium-card p-6 border-l-4 border-l-amber-500 flex flex-col justify-between">
        <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">Recent Transactions</h3>
        <p className="text-3xl font-bold text-slate-800">14 This Month</p>
      </div>
    </div>

    <div className="premium-card p-8 min-h-[300px] flex items-center justify-center bg-slate-50/50">
      <p className="text-slate-400 font-medium text-lg">Transaction History Chart (Coming Soon)</p>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'login',
        element: <div className="p-20 text-center min-h-[50vh] flex flex-col items-center justify-center"><h2 className="text-3xl font-bold text-slate-800 mb-4">Login Page</h2><p className="text-indigo-600 font-medium bg-indigo-50 px-4 py-2 rounded-full">Coming in Day 3</p></div>
      }
    ],
  },
  {
    path: '/dashboard',
    element: <ProtectedLayout />,
    children: [
      {
        path: '',
        element: <DashboardHome />,
      },
      {
        path: 'accounts',
        element: <div className="p-8 h-full flex items-center justify-center text-slate-400 font-medium text-xl bg-white/50 backdrop-blur-sm rounded-3xl border border-white">Accounts View (Pending)</div>
      },
      {
        path: 'transfer',
        element: <div className="p-8 h-full flex items-center justify-center text-slate-400 font-medium text-xl bg-white/50 backdrop-blur-sm rounded-3xl border border-white">Transfer Funds (Pending)</div>
      },
      {
        path: 'transactions',
        element: <div className="p-8 h-full flex items-center justify-center text-slate-400 font-medium text-xl bg-white/50 backdrop-blur-sm rounded-3xl border border-white">Transactions Detail (Pending)</div>
      },
      {
        path: 'settings',
        element: <div className="p-8 h-full flex items-center justify-center text-slate-400 font-medium text-xl bg-white/50 backdrop-blur-sm rounded-3xl border border-white">Settings panel (Pending)</div>
      }
    ],
  },
  {
    path: '*',
    element: <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50"><h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1><p className="text-xl font-medium text-slate-600">Page Not Found</p></div>
  }
]);

function App() {
  return (
    <div className="App antialiased selection:bg-indigo-100 selection:text-indigo-900">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

