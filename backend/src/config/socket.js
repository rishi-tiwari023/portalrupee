import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import User from '../models/user.model.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const cookies = socket.request.headers.cookie;
      if (!cookies) {
        return next(new Error('Authentication error: No cookies found'));
      }

      const parsedCookies = cookie.parse(cookies);
      const token = parsedCookies.jwt;

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select('-password -tpin');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new Error('Authentication error: Invalid token'));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new Error('Authentication error: Token expired'));
      }
      return next(new Error('Authentication error: Internal server error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket User connected: ${socket.user.firstName} (ID: ${socket.user._id}, Socket: ${socket.id})`);

    // Join a personal room for user-specific events
    socket.join(socket.user._id.toString());

    socket.on('disconnect', () => {
      console.log(`Socket User disconnected: ${socket.user.firstName} (Socket: ${socket.id})`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
