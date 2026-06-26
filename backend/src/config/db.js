import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Ensure mongoose doesn't buffer queries infinitely if disconnected
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if can't connect within 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Listen for disconnection events
    mongoose.connection.on('disconnected', () => {
      console.error('MongoDB disconnected! Forcing process exit to allow Docker to auto-restart and re-establish connection.');
      process.exit(1);
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
