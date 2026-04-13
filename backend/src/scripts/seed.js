import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import Account from '../models/account.model.js';

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

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Account.deleteMany();

    console.log('Inserting dummy users...');

    const users = await User.insertMany([
      {
        firstName: 'System',
        lastName: 'Manager',
        email: 'manager@portalrupee.com',
        mobile: '9000000001',
        password: 'password123',
        role: 'MANAGER'
      },
      {
        firstName: 'Bank',
        lastName: 'Cashier',
        email: 'cashier@portalrupee.com',
        mobile: '9000000002',
        password: 'password123',
        role: 'CASHIER'
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'customer@portalrupee.com',
        mobile: '9000000003',
        password: 'password123',
        role: 'CUSTOMER'
      }
    ]);

    const customer = users.find(u => u.role === 'CUSTOMER');

    console.log('Inserting dummy accounts...');

    await Account.insertMany([
      {
        user: customer._id,
        accountNumber: '1000000001',
        accountType: 'SAVINGS',
        balance: 45000,
        status: 'ACTIVE'
      },
      {
        user: customer._id,
        accountNumber: '1000000002',
        accountType: 'CURRENT',
        balance: 15300,
        status: 'ACTIVE'
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
