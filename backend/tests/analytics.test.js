import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Account from '../src/models/account.model.js';
import Transaction from '../src/models/transaction.model.js';
import { redisClient } from '../src/config/redis.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

// Setup mock Redis fallback
const mockStore = {};
const setupRedisMock = () => {
  redisClient.connect = async () => { console.log('Mock Redis Connected.'); };
  redisClient.quit = async () => { console.log('Mock Redis Quitted.'); };
  redisClient.set = async (key, val, options) => {
    mockStore[key] = val.toString();
    return 'OK';
  };
  redisClient.get = async (key) => {
    return mockStore[key] || null;
  };
  redisClient.del = async (key) => {
    delete mockStore[key];
    return 1;
  };
};

async function runAnalyticsTests() {
  let server;
  let baseUrl;

  const testEmail = 'analytics-test@example.com';
  const otherEmail = 'recipient-test@example.com';

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    setupRedisMock();

    // Start Express app on a dynamic free port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
    console.log(`Test server running at ${baseUrl}`);

    // Helper for making JSON requests
    const request = (method, path, body = null, headers = {}) => {
      return new Promise((resolve, reject) => {
        const url = `${baseUrl}${path}`;
        const options = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        };
        const req = http.request(url, options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const json = data ? JSON.parse(data) : {};
              resolve({ status: res.statusCode, headers: res.headers, body: json });
            } catch (e) {
              resolve({ status: res.statusCode, headers: res.headers, body: data });
            }
          });
        });
        req.on('error', reject);
        if (body) {
          req.write(JSON.stringify(body));
        }
        req.end();
      });
    };

    // 1. Cleanup existing test data
    console.log('Cleaning up existing test data...');
    const existingUsers = await User.find({ email: { $in: [testEmail, otherEmail] } });
    const userIds = existingUsers.map(u => u._id);
    await Account.deleteMany({ user: { $in: userIds } });
    await Transaction.deleteMany({
      $or: [
        { sender: { $in: userIds } },
        { receiver: { $in: userIds } }
      ]
    });
    await User.deleteMany({ _id: { $in: userIds } });

    // 2. Create Users
    console.log('Creating Test Users...');
    const user = await User.create({
      firstName: 'Analytics',
      lastName: 'User',
      email: testEmail,
      mobile: '9111111111',
      password: 'SecurePassword123!',
      role: 'CUSTOMER',
    });

    const otherUser = await User.create({
      firstName: 'Recipient',
      lastName: 'User',
      email: otherEmail,
      mobile: '9222222222',
      password: 'SecurePassword123!',
      role: 'CUSTOMER',
    });

    // 3. Create Accounts
    console.log('Creating Test Accounts...');
    const account = await Account.create({
      user: user._id,
      accountNumber: '1000000099',
      accountType: 'SAVINGS',
      balance: 50000,
      status: 'ACTIVE',
    });

    const otherAccount = await Account.create({
      user: otherUser._id,
      accountNumber: '2000000099',
      accountType: 'SAVINGS',
      balance: 10000,
      status: 'ACTIVE',
    });

    // 4. Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const authHeader = { Authorization: `Bearer ${token}` };

    // 5. Seed transactions
    console.log('Seeding transaction history...');
    const now = new Date();

    const transactionsToInsert = [
      // Current Period - Outflows (Expenses)
      {
        sender: user._id,
        receiver: otherUser._id,
        senderAccount: account._id,
        receiverAccount: otherAccount._id,
        amount: 2000,
        type: 'TRANSFER',
        description: 'zomato restaurant food order delivery',
        status: 'SUCCESS',
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        senderAccount: account._id,
        amount: 1500,
        type: 'WITHDRAW',
        description: 'ATM cash withdrawal',
        status: 'SUCCESS',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        sender: user._id,
        receiver: otherUser._id,
        senderAccount: account._id,
        receiverAccount: otherAccount._id,
        amount: 5000,
        type: 'TRANSFER',
        description: 'electricity utility bill payment',
        status: 'SUCCESS',
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        sender: user._id,
        receiver: otherUser._id,
        senderAccount: account._id,
        receiverAccount: otherAccount._id,
        amount: 3000,
        type: 'TRANSFER',
        description: 'amazon online shopping store purchase',
        status: 'SUCCESS',
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
      {
        sender: user._id,
        receiver: otherUser._id,
        senderAccount: account._id,
        receiverAccount: otherAccount._id,
        amount: 800,
        type: 'TRANSFER',
        description: 'uber cab travel ride',
        status: 'SUCCESS',
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      },
      {
        sender: user._id,
        receiver: otherUser._id,
        senderAccount: account._id,
        receiverAccount: otherAccount._id,
        amount: 10000,
        type: 'TRANSFER',
        description: 'groww mutual fund sip investment',
        status: 'SUCCESS',
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
      // Current Period - Inflows (Deposits/Received)
      {
        receiverAccount: account._id,
        amount: 25000,
        type: 'DEPOSIT',
        description: 'Monthly Salary Deposit',
        status: 'SUCCESS',
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      },
      {
        sender: otherUser._id,
        receiver: user._id,
        senderAccount: otherAccount._id,
        receiverAccount: account._id,
        amount: 15000,
        type: 'TRANSFER',
        description: 'splitwise payment received',
        status: 'SUCCESS',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      // Previous Period - Outflows (31 to 60 days ago)
      {
        sender: user._id,
        receiver: otherUser._id,
        senderAccount: account._id,
        receiverAccount: otherAccount._id,
        amount: 4000,
        type: 'TRANSFER',
        description: 'groceries store market payment',
        status: 'SUCCESS',
        createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
      },
      {
        senderAccount: account._id,
        amount: 2000,
        type: 'WITHDRAW',
        description: 'weekend ATM cash withdrawal',
        status: 'SUCCESS',
        createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
      },
    ];

    await Transaction.insertMany(transactionsToInsert);
    console.log('Seeded transactions.');

    // 6. Test Endpoint (Default 30d timeRange)
    console.log('\n--- Test 6.1: Get Analytics (Default 30d) ---');
    const res30d = await request('GET', '/api/v1/dashboard/analytics', null, authHeader);
    console.log('Status Code:', res30d.status);
    console.log('Body:', JSON.stringify(res30d.body, null, 2));

    if (res30d.status !== 200) {
      throw new Error(`Failed default analytics request. Status: ${res30d.status}`);
    }

    const { summary, inflowVsOutflow, spendingTrend, categoryBreakdown, typeBreakdown } = res30d.body.data;

    // Summary Assertions
    // Total Spent expected: 2000 + 1500 + 5000 + 3000 + 800 + 10000 = 22300
    if (summary.totalSpent !== 22300) {
      throw new Error(`Expected totalSpent to be 22300, got ${summary.totalSpent}`);
    }
    // Previous Period Spent expected: 4000 + 2000 = 6000
    if (summary.prevTotalSpent !== 6000) {
      throw new Error(`Expected prevTotalSpent to be 6000, got ${summary.prevTotalSpent}`);
    }
    // Average transaction size: 22300 / 6 = 3716.67
    if (summary.averageTransactionSize !== 3716.67) {
      throw new Error(`Expected averageTransactionSize to be 3716.67, got ${summary.averageTransactionSize}`);
    }
    // Max transaction size: 10000
    if (summary.maxTransactionSize !== 10000) {
      throw new Error(`Expected maxTransactionSize to be 10000, got ${summary.maxTransactionSize}`);
    }
    // Percentage Change: ((22300 - 6000) / 6000) * 100 = 271.67
    if (summary.percentageChange !== 271.67) {
      throw new Error(`Expected percentageChange to be 271.67, got ${summary.percentageChange}`);
    }
    // Total Transactions: 6
    if (summary.totalTransactions !== 6) {
      throw new Error(`Expected totalTransactions to be 6, got ${summary.totalTransactions}`);
    }

    console.log('Summary stats verified successfully!');

    // Inflow vs Outflow Assertions
    // Inflow: 25000 + 15000 = 40000
    // Outflow: 22300
    // Net savings: 40000 - 22300 = 17700
    if (inflowVsOutflow.inflow !== 40000) {
      throw new Error(`Expected inflow to be 40000, got ${inflowVsOutflow.inflow}`);
    }
    if (inflowVsOutflow.outflow !== 22300) {
      throw new Error(`Expected outflow to be 22300, got ${inflowVsOutflow.outflow}`);
    }
    if (inflowVsOutflow.netSavings !== 17700) {
      throw new Error(`Expected netSavings to be 17700, got ${inflowVsOutflow.netSavings}`);
    }
    console.log('Inflow vs Outflow stats verified successfully!');

    // Category Breakdown Assertions
    // Expected categories:
    // Food & Dining: 2000
    // Cash Withdrawal: 1500
    // Utilities & Bills: 5000
    // Shopping: 3000
    // Travel & Transport: 800
    // Investment & Savings: 10000
    const categoryMap = {};
    categoryBreakdown.forEach(c => {
      categoryMap[c.category] = c.amount;
    });

    if (categoryMap['Food & Dining'] !== 2000) {
      throw new Error(`Expected 'Food & Dining' to be 2000, got ${categoryMap['Food & Dining']}`);
    }
    if (categoryMap['Cash Withdrawal'] !== 1500) {
      throw new Error(`Expected 'Cash Withdrawal' to be 1500, got ${categoryMap['Cash Withdrawal']}`);
    }
    if (categoryMap['Utilities & Bills'] !== 5000) {
      throw new Error(`Expected 'Utilities & Bills' to be 5000, got ${categoryMap['Utilities & Bills']}`);
    }
    if (categoryMap['Shopping'] !== 3000) {
      throw new Error(`Expected 'Shopping' to be 3000, got ${categoryMap['Shopping']}`);
    }
    if (categoryMap['Travel & Transport'] !== 800) {
      throw new Error(`Expected 'Travel & Transport' to be 800, got ${categoryMap['Travel & Transport']}`);
    }
    if (categoryMap['Investment & Savings'] !== 10000) {
      throw new Error(`Expected 'Investment & Savings' to be 10000, got ${categoryMap['Investment & Savings']}`);
    }
    console.log('Category breakdown verified successfully!');

    // Spending Trend Assertions
    // The trend should have exactly 31 elements (since it spans 30 days plus starting point)
    console.log(`Spending Trend data points: ${spendingTrend.length}`);
    if (spendingTrend.length < 30) {
      throw new Error(`Expected spendingTrend to contain at least 30 elements, got ${spendingTrend.length}`);
    }
    // Verify that elements are ordered chronologically
    for (let i = 1; i < spendingTrend.length; i++) {
      if (spendingTrend[i].date.localeCompare(spendingTrend[i - 1].date) <= 0) {
        throw new Error(`Spending trend is not sorted chronologically: ${spendingTrend[i - 1].date} and ${spendingTrend[i].date}`);
      }
    }
    console.log('Spending trend format and sorting verified successfully!');

    // 7. Test timeRange: 7d
    console.log('\n--- Test 6.2: Get Analytics (7d) ---');
    const res7d = await request('GET', '/api/v1/dashboard/analytics?timeRange=7d', null, authHeader);
    console.log('Status Code:', res7d.status);
    if (res7d.status !== 200) {
      throw new Error(`Failed 7d analytics request. Status: ${res7d.status}`);
    }
    console.log(`7d Trend data points: ${res7d.body.data.spendingTrend.length} (Expected: 8)`);
    if (res7d.body.data.spendingTrend.length < 7 || res7d.body.data.spendingTrend.length > 9) {
      throw new Error(`Expected 7d trend to have around 8 data points, got ${res7d.body.data.spendingTrend.length}`);
    }

    // 8. Test invalid validation params
    console.log('\n--- Test 6.3: Get Analytics (Validation Error) ---');
    const resErr = await request('GET', '/api/v1/dashboard/analytics?timeRange=custom', null, authHeader);
    console.log('Status Code (Expected 400):', resErr.status);
    console.log('Body:', resErr.body);
    if (resErr.status !== 400) {
      throw new Error(`Expected 400 validation error for custom range without dates, got ${resErr.status}`);
    }

  } catch (error) {
    console.error('\n!!! TEST FAILED !!!');
    console.error(error);
    process.exit(1);
  } finally {
    console.log('\nCleaning up test records from database...');
    const users = await User.find({ email: { $in: [testEmail, otherEmail] } });
    const userIds = users.map(u => u._id);

    await Account.deleteMany({ user: { $in: userIds } });
    await Transaction.deleteMany({
      $or: [
        { sender: { $in: userIds } },
        { receiver: { $in: userIds } }
      ]
    });
    await User.deleteMany({ _id: { $in: userIds } });

    if (server) {
      server.close();
      console.log('Test server closed.');
    }
    await mongoose.disconnect();
    console.log('Disconnected database. Test runner finished.');
  }
}

runAnalyticsTests();
