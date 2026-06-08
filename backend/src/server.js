import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';
import { initializeSocket } from './config/socket.js';

dotenv.config();

// Connect to Database
connectDB();

// Connect to Redis
connectRedis();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Initialize Socket.io
initializeSocket(server);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
