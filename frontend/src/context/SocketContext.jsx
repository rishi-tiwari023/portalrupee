import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Initialize notifications from localStorage
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('portalrupee_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to load notifications from localStorage:', err);
      return [];
    }
  });

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('portalrupee_notifications', JSON.stringify(notifications));
    } catch (err) {
      console.error('Failed to save notifications to localStorage:', err);
    }
  }, [notifications]);

  // Derived state: unreadCount
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Notification helper actions
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  useEffect(() => {
    let newSocket;
    
    if (isAuthenticated && user) {
      const SOCKET_URL = new URL(import.meta.env.VITE_API_BASE_URL).origin;
      
      newSocket = io(SOCKET_URL, {
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        setIsConnected(false);
      });

      // Listen for transaction notifications
      newSocket.on('new_transaction_notification', (data) => {
        const newNotif = {
          id: data.transactionId ? `${data.transactionId}_${data.subType || data.type}` : `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: data.type, // 'DEPOSIT', 'WITHDRAW', 'TRANSFER'
          subType: data.subType, // 'SENT', 'RECEIVED'
          amount: data.amount,
          message: data.message,
          createdAt: data.createdAt || new Date().toISOString(),
          read: false,
        };

        setNotifications((prev) => [newNotif, ...prev]);

        toast.info(data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });

      // Listen for message notifications
      newSocket.on('new_message_notification', (data) => {
        // Suppress message notifications if the user is already on the messages page
        if (window.location.pathname === '/dashboard/messages') {
          return;
        }

        const newNotif = {
          id: data._id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'MESSAGE',
          message: `New message: "${data.content.length > 30 ? data.content.substring(0, 30) + '...' : data.content}"`,
          createdAt: data.createdAt || new Date().toISOString(),
          read: false,
        };

        setNotifications((prev) => [newNotif, ...prev]);

        toast.info(newNotif.message, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });

      setSocket(newSocket);
    }

    // Cleanup on unmount or when authentication state changes
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        unreadCount,
        markAllAsRead,
        clearNotifications,
        markAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

