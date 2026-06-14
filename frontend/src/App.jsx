import React, { useEffect, Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import PublicLayout from './layouts/PublicLayout';
import ProtectedLayout from './layouts/ProtectedLayout';
import { ToastContainer, toast } from 'react-toastify';
import RoleBasedRoute from './components/RoleBasedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { SocketProvider } from './context/SocketContext';

import './App.css';

// Page Loader spinner for lazy chunks
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 bg-slate-50/20 backdrop-blur-sm rounded-3xl border border-white/40">
    <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase animate-pulse">Loading PortalRupee...</p>
  </div>
);

// Lazy route helper wrapper
const lazyRoute = (importFunc) => {
  const LazyComponent = lazy(importFunc);
  return (
    <Suspense fallback={<PageLoader />}>
      <LazyComponent />
    </Suspense>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        path: '',
        element: lazyRoute(() => import('./pages/Home')),
      },
      {
        path: 'login',
        element: lazyRoute(() => import('./pages/Login'))
      },
      {
        path: 'register',
        element: lazyRoute(() => import('./pages/Register'))
      }
    ],
  },
  {
    path: '/dashboard',
    element: <ProtectedLayout />,
    children: [
      {
        path: '',
        element: lazyRoute(() => import('./pages/DashboardHome')),
      },
      {
        path: 'profile',
        element: lazyRoute(() => import('./pages/Profile')),
      },
      {
        path: 'accounts',
        element: lazyRoute(() => import('./pages/Accounts'))
      },
      {
        path: 'transfer',
        element: lazyRoute(() => import('./pages/Transfer'))
      },
      {
        path: 'transactions',
        element: lazyRoute(() => import('./pages/Transactions'))
      },
      {
        path: 'analytics',
        element: lazyRoute(() => import('./pages/Analytics'))
      },
      {
        path: 'kyc',
        element: lazyRoute(() => import('./pages/KYC'))
      },
      {
        path: 'messages',
        element: lazyRoute(() => import('./pages/Messages'))
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
            element: lazyRoute(() => import('./pages/Users'))
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

