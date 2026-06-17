import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/user.model.js';
import Account from '../src/models/account.model.js';
import Transaction from '../src/models/transaction.model.js';
import { setIO } from '../src/config/socket.js';
import {
  deposit,
  getPendingDeposits,
  approveDeposit,
} from '../src/controllers/transaction.controller.js';
import {
  freezeAccount,
  unfreezeAccount,
} from '../src/controllers/account.controller.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const createMockResponse = () => {
  const res = {
    statusCode: 200,
    responseData: null,
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.responseData = data;
      return this;
    },
  };
  return res;
};

const createMockNext = () => {
  return (err) => {
    if (err) {
      throw err;
    }
  };
};

async function runDay32Tests() {
  const custEmail = 'test-cust-d32@portalrupee.in';
  const cashEmail = 'test-cash-d32@portalrupee.in';
  const mgrEmail = 'test-mgr-d32@portalrupee.in';

  let customer, cashier, manager;
  let account;
  let pendingTxnId;

  // Setup Mock Socket IO to prevent uninitialized error
  const mockIO = {
    to: (room) => {
      return {
        emit: (event, payload) => {
          console.log(`[Mock Socket IO] Emitted to room ${room}: ${event}`);
        },
      };
    },
  };
  setIO(mockIO);

  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database Connected.');

    // 1. Cleanup old test data
    console.log('\nCleaning up old test data...');
    const testUsers = await User.find({ email: { $in: [custEmail, cashEmail, mgrEmail] } });
    const testUserIds = testUsers.map((u) => u._id);

    await Account.deleteMany({ $or: [{ user: { $in: testUserIds } }, { accountNumber: '123456789012' }] });
    await Transaction.deleteMany({
      $or: [
        { sender: { $in: testUserIds } },
        { receiver: { $in: testUserIds } },
      ],
    });
    await User.deleteMany({ email: { $in: [custEmail, cashEmail, mgrEmail] } });
    console.log('Cleanup complete.');

    // 2. Seed Users
    console.log('\nSeeding test users...');
    customer = await User.create({
      firstName: 'D32',
      lastName: 'Customer',
      email: custEmail,
      mobile: '9123456701',
      password: 'password123',
      role: 'CUSTOMER',
    });

    cashier = await User.create({
      firstName: 'D32',
      lastName: 'Cashier',
      email: cashEmail,
      mobile: '9123456702',
      password: 'password123',
      role: 'CASHIER',
    });

    manager = await User.create({
      firstName: 'D32',
      lastName: 'Manager',
      email: mgrEmail,
      mobile: '9123456703',
      password: 'password123',
      role: 'MANAGER',
    });

    // Seed Account
    account = await Account.create({
      user: customer._id,
      accountNumber: '123456789012',
      accountType: 'SAVINGS',
      balance: 1000,
      status: 'ACTIVE',
    });
    console.log('Seed complete. Initial balance:', account.balance);

    // 3. Test 1: Customer initiates deposit of 500
    console.log('\n--- Test 1: Customer initiates a deposit ---');
    const req1 = {
      body: {
        accountNumber: '123456789012',
        amount: 500,
        description: 'Self deposit 500',
      },
      user: customer,
    };
    const res1 = createMockResponse();
    await deposit(req1, res1, createMockNext());

    if (res1.statusCode !== 200) {
      throw new Error(`Expected 200 status code, got ${res1.statusCode}`);
    }

    const res1Data = res1.responseData;
    if (res1Data.message !== 'Deposit initiated and pending approval') {
      throw new Error(`Unexpected message: ${res1Data.message}`);
    }

    const createdTxn = res1Data.data.transaction;
    if (createdTxn.status !== 'PENDING') {
      throw new Error(`Expected PENDING status, got ${createdTxn.status}`);
    }
    pendingTxnId = createdTxn._id;

    // Verify account balance in database is unchanged
    const dbAccount1 = await Account.findById(account._id);
    if (dbAccount1.balance !== 1000) {
      throw new Error(`Expected balance to remain 1000, got ${dbAccount1.balance}`);
    }
    console.log('Test 1 Passed: Deposit is PENDING and balance is unchanged.');

    // 4. Test 2: Cashier fetches pending deposits
    console.log('\n--- Test 2: Cashier fetches pending deposits ---');
    const req2 = {
      query: { page: 1, limit: 10 },
      user: cashier,
    };
    const res2 = createMockResponse();
    await getPendingDeposits(req2, res2, createMockNext());

    if (res2.statusCode !== 200) {
      throw new Error(`Expected 200 status code, got ${res2.statusCode}`);
    }

    const pendingList = res2.responseData.data.transactions;
    if (!pendingList.some((t) => t._id.toString() === pendingTxnId.toString())) {
      throw new Error('Our pending transaction is not in the pending deposits list!');
    }
    console.log(`Test 2 Passed: Found pending transaction in list (Count: ${pendingList.length})`);

    // 5. Test 3: Cashier approves the deposit
    console.log('\n--- Test 3: Cashier approves the deposit ---');
    const req3 = {
      params: { id: pendingTxnId.toString() },
      body: { status: 'SUCCESS', description: 'Approved by Cashier in test' },
      user: cashier,
    };
    const res3 = createMockResponse();
    await approveDeposit(req3, res3, createMockNext());

    if (res3.statusCode !== 200) {
      throw new Error(`Expected 200 status code, got ${res3.statusCode}`);
    }

    // Verify account balance in database has increased
    const dbAccount2 = await Account.findById(account._id);
    if (dbAccount2.balance !== 1500) {
      throw new Error(`Expected balance to be 1500, got ${dbAccount2.balance}`);
    }

    // Verify transaction status is SUCCESS
    const dbTxn1 = await Transaction.findById(pendingTxnId);
    if (dbTxn1.status !== 'SUCCESS') {
      throw new Error(`Expected transaction status SUCCESS, got ${dbTxn1.status}`);
    }
    console.log('Test 3 Passed: Deposit approved, balance credited successfully.');

    // 6. Test 4: Customer initiates another deposit of 300, Cashier rejects it
    console.log('\n--- Test 4: Customer initiates and Cashier rejects a deposit ---');
    const req4 = {
      body: {
        accountNumber: '123456789012',
        amount: 300,
        description: 'Self deposit 300',
      },
      user: customer,
    };
    const res4 = createMockResponse();
    await deposit(req4, res4, createMockNext());

    const txnIdToReject = res4.responseData.data.transaction._id;

    // Reject it
    const req5 = {
      params: { id: txnIdToReject.toString() },
      body: { status: 'FAILED', description: 'Rejected in test' },
      user: cashier,
    };
    const res5 = createMockResponse();
    await approveDeposit(req5, res5, createMockNext());

    if (res5.statusCode !== 200) {
      throw new Error(`Expected 200 status code, got ${res5.statusCode}`);
    }

    // Verify account balance is unchanged
    const dbAccount3 = await Account.findById(account._id);
    if (dbAccount3.balance !== 1500) {
      throw new Error(`Expected balance to remain 1500, got ${dbAccount3.balance}`);
    }

    // Verify transaction status is FAILED
    const dbTxn2 = await Transaction.findById(txnIdToReject);
    if (dbTxn2.status !== 'FAILED') {
      throw new Error(`Expected transaction status FAILED, got ${dbTxn2.status}`);
    }
    console.log('Test 4 Passed: Deposit rejected, balance unchanged.');

    // 7. Test 5: Manager freezes the customer's account
    console.log('\n--- Test 5: Manager freezes the account ---');
    const req6 = {
      params: { id: account._id.toString() },
      user: manager,
    };
    const res6 = createMockResponse();
    await freezeAccount(req6, res6, createMockNext());

    if (res6.statusCode !== 200) {
      throw new Error(`Expected 200 status code, got ${res6.statusCode}`);
    }

    const dbAccount4 = await Account.findById(account._id);
    if (dbAccount4.status !== 'BLOCKED') {
      throw new Error(`Expected account status BLOCKED, got ${dbAccount4.status}`);
    }
    console.log('Test 5 Passed: Account is now BLOCKED (frozen).');

    // 8. Test 6: Customer attempts to deposit to blocked account
    console.log('\n--- Test 6: Customer attempts deposit to BLOCKED account ---');
    const req7 = {
      body: {
        accountNumber: '123456789012',
        amount: 100,
      },
      user: customer,
    };
    const res7 = createMockResponse();
    try {
      await deposit(req7, res7, (err) => {
        if (err) {
          console.log('Expected error thrown:', err.message);
          if (err.message !== 'Account is not active') {
            throw err;
          }
        }
      });
      console.log('Test 6 Passed: Blocked account deposit correctly rejected.');
    } catch (e) {
      if (e.message !== 'Account is not active') {
        throw e;
      }
      console.log('Test 6 Passed: Blocked account deposit correctly rejected (threw error).');
    }

    // 9. Test 7: Manager unfreezes the account
    console.log('\n--- Test 7: Manager unfreezes the account ---');
    const req8 = {
      params: { id: account._id.toString() },
      user: manager,
    };
    const res8 = createMockResponse();
    await unfreezeAccount(req8, res8, createMockNext());

    if (res8.statusCode !== 200) {
      throw new Error(`Expected 200 status code, got ${res8.statusCode}`);
    }

    const dbAccount5 = await Account.findById(account._id);
    if (dbAccount5.status !== 'ACTIVE') {
      throw new Error(`Expected account status ACTIVE, got ${dbAccount5.status}`);
    }
    console.log('Test 7 Passed: Account is now ACTIVE (unfrozen) again.');

    // Cleanup test data
    console.log('\nCleaning up test data...');
    await Account.deleteMany({ $or: [{ user: { $in: testUserIds } }, { accountNumber: '123456789012' }] });
    await Transaction.deleteMany({
      $or: [
        { sender: { $in: testUserIds } },
        { receiver: { $in: testUserIds } },
      ],
    });
    await User.deleteMany({ email: { $in: [custEmail, cashEmail, mgrEmail] } });
    console.log('Cleanup complete.');
  } catch (error) {
    console.error('\n!!! TEST SUITE FAILED !!!');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected database. Exiting.');
  }
}

runDay32Tests();
