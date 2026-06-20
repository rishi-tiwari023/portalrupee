import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to DB: ${error.message}`);
    process.exit(1);
  }
};

const approveAllUsers = async () => {
  try {
    await connectDB();
    console.log('Approving all existing users...');
    
    const result = await User.updateMany(
      {},
      { $set: { approvalStatus: 'APPROVED' } }
    );
    
    console.log(`Successfully approved ${result.modifiedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
};

approveAllUsers();
