import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import ProtectedLayout from './layouts/ProtectedLayout';

// Pages
import Home from './pages/Home';
import DashboardHome from './pages/DashboardHome';
import Login from './pages/Login';
import Register from './pages/Register';

import './App.css';

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
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
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
    <div className="App antialiased selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

