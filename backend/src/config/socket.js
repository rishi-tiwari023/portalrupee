import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import User from '../models/user.model.js';
import { checkChatPermission } from '../utils/chat.util.js';
import Message from '../models/message.model.js';

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

    // Permission-based joining of chat rooms
    socket.on('join_chat', async (data, callback) => {
      try {
        const { targetUserId } = data || {};
        if (!targetUserId) {
          if (callback) callback({ status: 'error', message: 'targetUserId is required' });
          return;
        }

        const hasPermission = await checkChatPermission(socket.user._id, targetUserId);
        if (!hasPermission) {
          if (callback) {
            callback({ 
              status: 'error', 
              message: 'Messaging is not allowed. No transaction history found between users.' 
            });
          }
          return;
        }

        const roomId = `chat_${[socket.user._id.toString(), targetUserId.toString()].sort().join('_')}`;
        socket.join(roomId);
        console.log(`Socket: User ${socket.user._id} joined room ${roomId}`);

        if (callback) {
          callback({ status: 'success', roomId, targetUserId });
        }
      } catch (error) {
        console.error('Socket join_chat error:', error);
        if (callback) callback({ status: 'error', message: 'Internal server error' });
      }
    });

    socket.on('send_message', async (data, callback) => {
      try {
        const { targetUserId, content } = data || {};
        if (!targetUserId || !content) {
          if (callback) callback({ status: 'error', message: 'targetUserId and content are required' });
          return;
        }

        const hasPermission = await checkChatPermission(socket.user._id, targetUserId);
        if (!hasPermission) {
          if (callback) callback({ status: 'error', message: 'Messaging is not allowed.' });
          return;
        }

        const roomId = `chat_${[socket.user._id.toString(), targetUserId.toString()].sort().join('_')}`;
        
        const newMessage = await Message.create({
          sender: socket.user._id,
          receiver: targetUserId,
          roomId,
          content
        });

        // Emit receive_message to the chat room
        io.to(roomId).emit('receive_message', newMessage);

        // Emit generic notification to the target user's personal room
        socket.to(targetUserId.toString()).emit('new_message_notification', newMessage);

        if (callback) callback({ status: 'success', data: newMessage });
      } catch (error) {
        console.error('Socket send_message error:', error);
        if (callback) callback({ status: 'error', message: 'Internal server error' });
      }
    });

    socket.on('typing', ({ roomId }) => {
      if (roomId) socket.to(roomId).emit('typing', { userId: socket.user._id });
    });

    socket.on('stop_typing', ({ roomId }) => {
      if (roomId) socket.to(roomId).emit('stop_typing', { userId: socket.user._id });
    });

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
