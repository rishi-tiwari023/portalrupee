import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import Account from '../models/account.model.js';
import bcrypt from 'bcryptjs';

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
    // Do not clear existing data to avoid affecting existing users and accounts
    // console.log('Clearing existing data...');
    // await User.deleteMany();
    // await Account.deleteMany();

    console.log('Inserting dummy users...');

    const userData = [
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@portalrupee.com',
        mobile: '9000000000',
        password: 'Password@123',
        role: 'ADMIN',
        approvalStatus: 'APPROVED'
      },
      {
        firstName: 'System',
        lastName: 'Manager',
        email: 'manager@portalrupee.com',
        mobile: '9000000001',
        password: 'Password@123',
        role: 'MANAGER',
        approvalStatus: 'APPROVED'
      },
      {
        firstName: 'Bank',
        lastName: 'Cashier',
        email: 'cashier@portalrupee.com',
        mobile: '9000000002',
        password: 'Password@123',
        role: 'CASHIER',
        approvalStatus: 'APPROVED'
      },
      {
        firstName: 'Mr.',
        lastName: 'Customer',
        email: 'customer@portalrupee.com',
        mobile: '9000000003',
        password: 'Password@123',
        tpin: '111111',
        role: 'CUSTOMER',
        approvalStatus: 'APPROVED'
      },
      {
        firstName: 'Mrs.',
        lastName: 'Customer',
        email: 'customer2@portalrupee.com',
        mobile: '9000000004',
        password: 'Password@123',
        tpin: '111111',
        role: 'CUSTOMER',
        approvalStatus: 'APPROVED'
      }
    ];

    const users = [];
    for (const u of userData) {
      // Hash password and tpin
      const hashedUser = { ...u };
      if (u.password) hashedUser.password = await bcrypt.hash(u.password, 12);
      if (u.tpin) {
        hashedUser.tpin = await bcrypt.hash(u.tpin, 12);
        hashedUser.tpinSet = true;
      }

      const user = await User.findOneAndUpdate(
        { email: u.email },
        { $set: hashedUser },
        { upsert: true, new: true, runValidators: true }
      );
      users.push(user);
    }

    const customer = users.find(u => u.email === 'customer@portalrupee.com');
    const receiver = users.find(u => u.email === 'customer2@portalrupee.com');

    console.log('Inserting dummy accounts...');

    const accountData = [
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
      },
      {
        user: receiver._id,
        accountNumber: '1000000003',
        accountType: 'SAVINGS',
        balance: 5000,
        status: 'ACTIVE'
      }
    ];

    for (const a of accountData) {
      await Account.findOneAndUpdate(
        { accountNumber: a.accountNumber },
        { $set: a },
        { upsert: true, new: true }
      );
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
