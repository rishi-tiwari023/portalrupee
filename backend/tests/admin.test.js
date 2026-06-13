import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/user.model.js';
import Account from '../src/models/account.model.js';
import Transaction from '../src/models/transaction.model.js';
import AuditLog from '../src/models/auditLog.model.js';
import {
  listUsers,
  getKycQueue,
  updateKycStatus,
  getSystemStats,
} from '../src/controllers/admin.controller.js';

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

async function runAdminTests() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database Connected.');

    const custEmail = 'cust-1@admin-test.com';
    const mgrEmail = 'mgr-1@admin-test.com';

    // 1. Cleanup existing test data
    console.log('\nCleaning up old test data...');
    const testUsers = await User.find({ email: { $in: [custEmail, mgrEmail] } });
    const testUserIds = testUsers.map(u => u._id);

    await Account.deleteMany({ user: { $in: testUserIds } });
    await Transaction.deleteMany({
      $or: [
        { sender: { $in: testUserIds } },
        { receiver: { $in: testUserIds } }
      ]
    });
    await AuditLog.deleteMany({ actor: { $in: testUserIds } });
    await User.deleteMany({ email: { $in: [custEmail, mgrEmail] } });
    console.log('Cleanup complete.');

    // 2. Create seed data
    console.log('\nSeeding test users...');
    const customer = await User.create({
      firstName: 'AdminTest',
      lastName: 'Customer',
      email: custEmail,
      mobile: '9777777777',
      password: 'securePassword123',
      role: 'CUSTOMER',
      kycStatus: 'PENDING',
      kycDocumentKey: 'test-id-doc-key.pdf',
      kycSignatureKey: 'test-sig-doc-key.png'
    });

    const manager = await User.create({
      firstName: 'AdminTest',
      lastName: 'Manager',
      email: mgrEmail,
      mobile: '9666666666',
      password: 'securePassword123',
      role: 'MANAGER',
    });

    console.log('Seeding account...');
    const account = await Account.create({
      user: customer._id,
      accountNumber: '999988887777',
      accountType: 'SAVINGS',
      balance: 750,
      status: 'ACTIVE'
    });

    console.log('Seeding transaction...');
    const transaction = await Transaction.create({
      receiver: customer._id,
      receiverAccount: account._id,
      amount: 150,
      type: 'DEPOSIT',
      status: 'SUCCESS',
      description: 'Test Admin Stats Deposit'
    });

    console.log('Seeding audit log...');
    await AuditLog.create({
      actor: manager._id,
      action: 'TEST_ACTION',
      resource: 'USER',
      resourceId: customer._id.toString(),
      status: 'SUCCESS'
    });

    console.log('Seeding completed successfully.');
    console.log('\n--- Test 1: listUsers ---');
    const listReq = {
      query: { page: 1, limit: 10 }
    };
    const listRes = createMockResponse();
    await listUsers(listReq, listRes, createMockNext());

    if (listRes.statusCode !== 200 || listRes.responseData.status !== 'success') {
      throw new Error(`listUsers failed with code: ${listRes.statusCode}`);
    }

    const usersList = listRes.responseData.data.users;
    console.log(`Fetched ${usersList.length} users successfully.`);
    if (usersList.length < 2) {
      throw new Error('Expected at least 2 users in the list.');
    }

    // Role filtering test
    const listCustReq = {
      query: { page: 1, limit: 10, role: 'CUSTOMER' }
    };
    const listCustRes = createMockResponse();
    await listUsers(listCustReq, listCustRes, createMockNext());
    const onlyCustomers = listCustRes.responseData.data.users;
    console.log(`Filtered by role CUSTOMER: returned ${onlyCustomers.length} users.`);
    if (onlyCustomers.some(u => u.role !== 'CUSTOMER')) {
      throw new Error('Role filtering returned non-CUSTOMER role.');
    }

    // Search query test
    const listSearchReq = {
      query: { page: 1, limit: 10, search: 'Customer' }
    };
    const listSearchRes = createMockResponse();
    await listUsers(listSearchReq, listSearchRes, createMockNext());
    const searchedUsers = listSearchRes.responseData.data.users;
    console.log(`Searched for "Customer": returned ${searchedUsers.length} users.`);
    if (!searchedUsers.some(u => u.email === custEmail)) {
      throw new Error('Search did not return the seeded customer user.');
    }
    console.log('Test 1: Passed!');

    console.log('\n--- Test 2: getKycQueue ---');
    const queueReq = {};
    const queueRes = createMockResponse();
    await getKycQueue(queueReq, queueRes, createMockNext());

    if (queueRes.statusCode !== 200 || queueRes.responseData.status !== 'success') {
      throw new Error(`getKycQueue failed with status code: ${queueRes.statusCode}`);
    }

    const queue = queueRes.responseData.data.queue;
    console.log(`Fetched KYC Pending queue, items: ${queue.length}`);
    const queueCust = queue.find(u => u.email === custEmail);
    if (!queueCust) {
      throw new Error('Seeded customer was not found in KYC PENDING queue.');
    }
    if (!queueCust.kycDocumentUrl || !queueCust.kycSignatureUrl) {
      throw new Error('Pre-signed URLs were not generated for KYC documents.');
    }
    console.log('Pre-signed KYC Document URL:', queueCust.kycDocumentUrl);
    console.log('Pre-signed KYC Signature URL:', queueCust.kycSignatureUrl);
    console.log('Test 2: Passed!');

    console.log('\n--- Test 3: updateKycStatus ---');
    const kycReq = {
      params: { id: customer._id.toString() },
      body: { status: 'VERIFIED' }
    };
    const kycRes = createMockResponse();
    await updateKycStatus(kycReq, kycRes, createMockNext());

    if (kycRes.statusCode !== 200 || kycRes.responseData.status !== 'success') {
      throw new Error(`updateKycStatus failed with code: ${kycRes.statusCode}`);
    }

    const updatedCust = await User.findById(customer._id);
    console.log(`Updated KYC status in DB: ${updatedCust.kycStatus} (Expected: VERIFIED)`);
    if (updatedCust.kycStatus !== 'VERIFIED') {
      throw new Error('KYC Status was not successfully updated to VERIFIED in DB.');
    }
    console.log('Test 3: Passed!');

    console.log('\n--- Test 4: getSystemStats ---');
    const statsReq = {};
    const statsRes = createMockResponse();
    await getSystemStats(statsReq, statsRes, createMockNext());

    if (statsRes.statusCode !== 200 || statsRes.responseData.status !== 'success') {
      throw new Error(`getSystemStats failed with code: ${statsRes.statusCode}`);
    }

    const stats = statsRes.responseData.data;
    console.log('System Stats Data:');
    console.log(' - Users:', stats.users);
    console.log(' - Accounts:', stats.accounts);
    console.log(' - Transactions:', stats.transactions);
    console.log(' - Recent Transactions fetched:', stats.recentTransactions.length);
    console.log(' - Recent Audit Logs fetched:', stats.recentAuditLogs.length);

    if (stats.users.total < 2) {
      throw new Error('Stats total users count is incorrect.');
    }
    if (stats.accounts.total < 1 || stats.accounts.totalBalance < 750) {
      throw new Error('Stats accounts total or balance aggregate is incorrect.');
    }
    if (stats.transactions.totalCount < 1 || stats.transactions.totalVolume < 150) {
      throw new Error('Stats transactions total or volume aggregate is incorrect.');
    }
    console.log('Test 4: Passed!');

    // 5. Cleanup test data
    console.log('\nCleaning up test data...');
    await Account.deleteMany({ user: { $in: testUserIds } });
    await Transaction.deleteMany({
      $or: [
        { sender: { $in: testUserIds } },
        { receiver: { $in: testUserIds } }
      ]
    });
    await AuditLog.deleteMany({ actor: { $in: testUserIds } });
    await User.deleteMany({ email: { $in: [custEmail, mgrEmail] } });
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

runAdminTests();
