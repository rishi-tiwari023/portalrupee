import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';
import Account from './src/models/account.model.js';

dotenv.config();

async function checkData() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find();
  const accounts = await Account.find();
  
  console.log('--- Users ---');
  users.forEach(u => console.log(`${u._id} - ${u.email} - ${u.firstName}`));
  
  console.log('\n--- Accounts ---');
  accounts.forEach(a => console.log(`${a.accountNumber} - User: ${a.user} - Balance: ${a.balance}`));
  
  await mongoose.disconnect();
}

checkData();
