import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import PublicLayout from './layouts/PublicLayout';
import ProtectedLayout from './layouts/ProtectedLayout';
import { ToastContainer } from 'react-toastify';
import RoleBasedRoute from './components/RoleBasedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import DashboardHome from './pages/DashboardHome';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

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
        path: 'profile',
        element: <Profile />,
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
      },
      // Admin/Manager Only Routes
      {
        element: <RoleBasedRoute allowedRoles={['MANAGER']} />,
        children: [
          {
            path: 'users',
            element: <div className="p-8 h-full flex items-center justify-center text-slate-400 font-medium text-xl bg-white/50 backdrop-blur-sm rounded-3xl border border-white font-bold">User Management (Manager Only)</div>
          }
        ]
      }
    ],
  },
  {
    path: '*',
    element: <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50"><h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1><p className="text-xl font-medium text-slate-600">Page Not Found</p></div>
  }
]);

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token but no user data, fetch it
    if (token && !user) {
      dispatch(getMe());
    }
  }, [dispatch, token, user]);

  return (
    <div className="App antialiased selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;

