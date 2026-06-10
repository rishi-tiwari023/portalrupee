import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/user.model.js';
import Account from '../src/models/account.model.js';
import Transaction from '../src/models/transaction.model.js';
import { setIO } from '../src/config/socket.js';
import { deposit, withdraw, transferMoney } from '../src/controllers/transaction.controller.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

async function runNotificationTests() {

  const testUserEmails = [
    'test-notify-a@example.com',
    'test-notify-b@example.com'
  ];

  let userA, userB;
  let accountA, accountB;
  const emittedEvents = [];

  // Setup Mock IO
  const mockIO = {
    to: (room) => {
      return {
        emit: (event, payload) => {
          emittedEvents.push({ room, event, payload });
        }
      };
    }
  };
  setIO(mockIO);

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    // Cleanup
    console.log('Cleaning up existing test data...');
    const testUserMobiles = ['9888888801', '9888888802'];
    const existingUsers = await User.find({
      $or: [
        { email: { $in: testUserEmails } },
        { mobile: { $in: testUserMobiles } }
      ]
    });
    const userIds = existingUsers.map(u => u._id);

    await Account.deleteMany({ user: { $in: userIds } });
    await Transaction.deleteMany({
      $or: [
        { sender: { $in: userIds } },
        { receiver: { $in: userIds } }
      ]
    });
    await User.deleteMany({ _id: { $in: userIds } });
    console.log('Cleanup complete.');

    // Create test users
    console.log('Creating test users A and B...');
    userA = await User.create({
      firstName: 'NotifySender',
      lastName: 'UserA',
      email: 'test-notify-a@example.com',
      mobile: '9888888801',
      password: 'testPassword123',
      role: 'CUSTOMER'
    });

    userB = await User.create({
      firstName: 'NotifyReceiver',
      lastName: 'UserB',
      email: 'test-notify-b@example.com',
      mobile: '9888888802',
      password: 'testPassword123',
      role: 'CUSTOMER'
    });

    // Create accounts
    accountA = await Account.create({
      user: userA._id,
      accountNumber: 'ACCNOTIFY01',
      type: 'SAVINGS',
      balance: 1000,
      status: 'ACTIVE'
    });

    accountB = await Account.create({
      user: userB._id,
      accountNumber: 'ACCNOTIFY02',
      type: 'SAVINGS',
      balance: 500,
      status: 'ACTIVE'
    });

    console.log(`Users created: A(${userA._id}), B(${userB._id})`);

    // Helper for Mock Response
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
        }
      };
      return res;
    };

    // 1. Test Deposit Notification
    emittedEvents.length = 0; // Clear events
    const reqDeposit = {
      body: {
        accountNumber: 'ACCNOTIFY01',
        amount: 200,
        description: 'Test Deposit'
      },
      user: { id: userA._id.toString() }
    };
    const resDeposit = createMockResponse();

    await deposit(reqDeposit, resDeposit, (err) => { if (err) throw err; });
    console.log('HTTP Response Status:', resDeposit.statusCode);
    if (resDeposit.statusCode !== 200) {
      throw new Error(`Deposit failed with status ${resDeposit.statusCode}`);
    }

    console.log('Emitted events count:', emittedEvents.length);
    if (emittedEvents.length !== 1) {
      throw new Error('Expected 1 notification to be emitted');
    }

    const depEvent = emittedEvents[0];
    console.log('Event details:', depEvent);
    if (depEvent.room !== userA._id.toString()) {
      throw new Error('Notification emitted to incorrect user room');
    }
    if (depEvent.event !== 'new_transaction_notification') {
      throw new Error('Incorrect event type emitted');
    }
    if (depEvent.payload.type !== 'DEPOSIT' || depEvent.payload.amount !== 200) {
      throw new Error('Incorrect notification payload contents');
    }
    console.log('Deposit Notification Test Passed!');

    // 2. Test Withdrawal Notification
    emittedEvents.length = 0; // Clear events
    const reqWithdraw = {
      body: {
        accountNumber: 'ACCNOTIFY01',
        amount: 100,
        description: 'Test Withdraw'
      },
      user: userA // Full user object needed as authMiddleware does
    };
    const resWithdraw = createMockResponse();

    await withdraw(reqWithdraw, resWithdraw, (err) => { if (err) throw err; });
    console.log('HTTP Response Status:', resWithdraw.statusCode);
    if (resWithdraw.statusCode !== 200) {
      throw new Error(`Withdrawal failed with status ${resWithdraw.statusCode}`);
    }

    console.log('Emitted events count:', emittedEvents.length);
    if (emittedEvents.length !== 1) {
      throw new Error('Expected 1 notification to be emitted');
    }

    const wdrEvent = emittedEvents[0];
    console.log('Event details:', wdrEvent);
    if (wdrEvent.room !== userA._id.toString()) {
      throw new Error('Notification emitted to incorrect user room');
    }
    if (wdrEvent.event !== 'new_transaction_notification') {
      throw new Error('Incorrect event type emitted');
    }
    if (wdrEvent.payload.type !== 'WITHDRAW' || wdrEvent.payload.amount !== 100) {
      throw new Error('Incorrect notification payload contents');
    }
    console.log('Withdrawal Notification Test Passed!');

    // 3. Test Transfer Notification (both sender and receiver)
    emittedEvents.length = 0; // Clear events
    const reqTransfer = {
      body: {
        receiverId: userB._id.toString(),
        amount: 150,
        senderAccountId: accountA._id.toString(),
        description: 'Test Transfer'
      },
      user: userA
    };
    const resTransfer = createMockResponse();

    await transferMoney(reqTransfer, resTransfer, (err) => { if (err) throw err; });
    console.log('HTTP Response Status:', resTransfer.statusCode);
    if (resTransfer.statusCode !== 200) {
      throw new Error(`Transfer failed with status ${resTransfer.statusCode}: ${JSON.stringify(resTransfer.responseData)}`);
    }

    console.log('Emitted events count:', emittedEvents.length);
    if (emittedEvents.length !== 2) {
      throw new Error('Expected 2 notifications to be emitted');
    }

    const senderEvent = emittedEvents.find(e => e.room === userA._id.toString());
    const receiverEvent = emittedEvents.find(e => e.room === userB._id.toString());

    if (!senderEvent || !receiverEvent) {
      throw new Error('Missing sender or receiver notification events');
    }

    console.log('Sender Event details:', senderEvent);
    console.log('Receiver Event details:', receiverEvent);

    if (senderEvent.payload.type !== 'TRANSFER' || senderEvent.payload.subType !== 'SENT' || senderEvent.payload.amount !== 150) {
      throw new Error('Incorrect payload for sender event');
    }
    if (!senderEvent.payload.message.includes('NotifyReceiver UserB')) {
      throw new Error('Sender message did not contain receiver\'s name');
    }

    if (receiverEvent.payload.type !== 'TRANSFER' || receiverEvent.payload.subType !== 'RECEIVED' || receiverEvent.payload.amount !== 150) {
      throw new Error('Incorrect payload for receiver event');
    }
    if (!receiverEvent.payload.message.includes('NotifySender UserA')) {
      throw new Error('Receiver message did not contain sender\'s name');
    }

    console.log('Transfer Notification Test Passed!');

  } catch (error) {
    console.error('\n!!! TEST FAILED !!!');
    console.error(error);
    process.exit(1);
  } finally {
    console.log('\nCleaning up test records...');
    if (userA && userB) {
      const userIds = [userA._id, userB._id];
      await Account.deleteMany({ user: { $in: userIds } });
      await Transaction.deleteMany({
        $or: [
          { sender: { $in: userIds } },
          { receiver: { $in: userIds } }
        ]
      });
      await User.deleteMany({ _id: { $in: userIds } });
    }
    await mongoose.disconnect();
    console.log('Disconnected database. Test runner finished.');
  }
}

runNotificationTests();
