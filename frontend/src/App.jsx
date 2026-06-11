import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import PublicLayout from './layouts/PublicLayout';
import ProtectedLayout from './layouts/ProtectedLayout';
import { ToastContainer, toast } from 'react-toastify';
import RoleBasedRoute from './components/RoleBasedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { SocketProvider } from './context/SocketContext';

// Pages
import Home from './pages/Home';
import DashboardHome from './pages/DashboardHome';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Accounts from './pages/Accounts';
import Transfer from './pages/Transfer';
import Transactions from './pages/Transactions';
import KYC from './pages/KYC';
import Messages from './pages/Messages';
import Analytics from './pages/Analytics';

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
        element: <Accounts />
      },
      {
        path: 'transfer',
        element: <Transfer />
      },
      {
        path: 'transactions',
        element: <Transactions />
      },
      {
        path: 'analytics',
        element: <Analytics />
      },
      {
        path: 'kyc',
        element: <KYC />
      },
      {
        path: 'messages',
        element: <Messages />
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
    // With HttpOnly cookies, we don't have the token in JS. 
    // Always attempt to fetch the user profile on initial load.
    if (!user) {
      dispatch(getMe());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const handleOnline = () => {
      toast.dismiss('offline-alert');
      toast.success('System Alert: Connection restored. You are back online!', {
        toastId: 'online-alert',
        autoClose: 3000,
        className: 'premium-toast',
      });
    };

    const handleOffline = () => {
      toast.error('System Alert: You are currently offline. Some features may not work.', {
        toastId: 'offline-alert',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        className: 'premium-toast',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="App antialiased selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      <ErrorBoundary>
        <SocketProvider>
          <RouterProvider router={router} />
        </SocketProvider>
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
        style={{ zIndex: 99999 }}
      />
    </div>
  );
}

export default App;

