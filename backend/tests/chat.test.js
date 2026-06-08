import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/user.model.js';
import Account from '../src/models/account.model.js';
import Transaction from '../src/models/transaction.model.js';
import { checkChatPermission } from '../src/utils/chat.util.js';
import { getChatRooms, checkPermission } from '../src/controllers/chat.controller.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

async function runChatTests() {
  console.log('--- Starting Chat Service and Permission Tests ---');

  // Track created test IDs for reliable cleanup
  const testUserEmails = [
    'test-chat-a@example.com',
    'test-chat-b@example.com',
    'test-chat-c@example.com'
  ];

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    // 1. Initial cleanup
    console.log('Cleaning up existing test data...');
    const testUserMobiles = ['9000000001', '9000000002', '9000000003'];
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

    // 2. Create Test Users
    console.log('\nCreating Test Users A, B, and C...');
    const userA = await User.create({
      firstName: 'User',
      lastName: 'A',
      email: 'test-chat-a@example.com',
      mobile: '9000000001',
      password: 'testPassword123',
      role: 'CUSTOMER'
    });

    const userB = await User.create({
      firstName: 'User',
      lastName: 'B',
      email: 'test-chat-b@example.com',
      mobile: '9000000002',
      password: 'testPassword123',
      role: 'CUSTOMER'
    });

    const userC = await User.create({
      firstName: 'User',
      lastName: 'C',
      email: 'test-chat-c@example.com',
      mobile: '9000000003',
      password: 'testPassword123',
      role: 'CUSTOMER'
    });
    console.log(`Users created: A(${userA._id}), B(${userB._id}), C(${userC._id})`);

    // 3. Create Test Accounts for the users (required by Transaction validation)
    console.log('\nCreating Account records for users...');
    const accountA = await Account.create({
      user: userA._id,
      accountNumber: 'ACCCHAT001',
      type: 'SAVINGS',
      balance: 1000,
      status: 'ACTIVE'
    });

    const accountB = await Account.create({
      user: userB._id,
      accountNumber: 'ACCCHAT002',
      type: 'SAVINGS',
      balance: 500,
      status: 'ACTIVE'
    });

    const accountC = await Account.create({
      user: userC._id,
      accountNumber: 'ACCCHAT003',
      type: 'SAVINGS',
      balance: 100,
      status: 'ACTIVE'
    });
    console.log('Accounts created.');

    const permAB_init = await checkChatPermission(userA._id, userB._id);
    console.log(`Permission User A <-> User B: ${permAB_init} (Expected: false)`);
    if (permAB_init !== false) throw new Error('Initial permission should be false');

    console.log('Testing getChatRooms Controller...');
    const reqRoomsInit = { user: { id: userA._id.toString() } };
    const resRoomsInit = {
      statusCode: null,
      responseData: null,
      status: function (c) { this.statusCode = c; return this; },
      json: function (d) { this.responseData = d; return this; }
    };
    await getChatRooms(reqRoomsInit, resRoomsInit, (err) => { if (err) throw err; });
    console.log(`HTTP Status: ${resRoomsInit.statusCode} (Expected: 200)`);
    console.log(`Results: ${resRoomsInit.responseData.results} (Expected: 0)`);
    if (resRoomsInit.responseData.results !== 0) throw new Error('Rooms list should be empty');

    console.log('Testing checkPermission Controller...');
    const reqPermInit = {
      user: { id: userA._id.toString() },
      params: { targetUserId: userB._id.toString() }
    };
    const resPermInit = {
      statusCode: null,
      responseData: null,
      status: function (c) { this.statusCode = c; return this; },
      json: function (d) { this.responseData = d; return this; }
    };
    await checkPermission(reqPermInit, resPermInit, (err) => { if (err) throw err; });
    console.log(`HTTP Status: ${resPermInit.statusCode} (Expected: 200)`);
    console.log(`hasPermission: ${resPermInit.responseData.data.hasPermission} (Expected: false)`);
    if (resPermInit.responseData.data.hasPermission !== false) throw new Error('Permission API should return false');

    console.log('Simulating Socket join_chat event...');
    let socketJoinedRooms = [];
    const mockSocket = {
      user: userA,
      id: 'test-socket-id',
      join: (room) => { socketJoinedRooms.push(room); }
    };

    // Helper to simulate Socket.io logic
    const simulateSocketJoinChat = async (socket, targetUserId) => {
      return new Promise((resolve) => {
        // Logic from socket.on('join_chat')
        const handleJoin = async (data, callback) => {
          try {
            const { targetUserId: tId } = data || {};
            if (!tId) return callback({ status: 'error', message: 'targetUserId is required' });

            const hasPermission = await checkChatPermission(socket.user._id, tId);
            if (!hasPermission) {
              return callback({
                status: 'error',
                message: 'Messaging is not allowed. No transaction history found between users.'
              });
            }

            const roomId = `chat_${[socket.user._id.toString(), tId.toString()].sort().join('_')}`;
            socket.join(roomId);
            callback({ status: 'success', roomId, targetUserId: tId });
          } catch (error) {
            callback({ status: 'error', message: error.message });
          }
        };

        handleJoin({ targetUserId }, (res) => resolve(res));
      });
    };

    const socketResInit = await simulateSocketJoinChat(mockSocket, userB._id.toString());
    console.log(`Socket join result: status = ${socketResInit.status}, message = "${socketResInit.message}" (Expected: error)`);
    if (socketResInit.status !== 'error') throw new Error('Socket join should have failed');
    if (socketJoinedRooms.length !== 0) throw new Error('Socket should not have joined any room');

    console.log('Creating a successful TRANSFER transaction from User A to User B...');
    const transaction = await Transaction.create({
      sender: userA._id,
      receiver: userB._id,
      senderAccount: accountA._id,
      receiverAccount: accountB._id,
      amount: 150,
      type: 'TRANSFER',
      description: 'Test Transfer for Chat',
      status: 'SUCCESS'
    });
    console.log(`Transaction created: ID = ${transaction.transactionId}`);

    const permAB_post = await checkChatPermission(userA._id, userB._id);
    const permBA_post = await checkChatPermission(userB._id, userA._id); // Symmetric
    const permAC_post = await checkChatPermission(userA._id, userC._id);
    console.log(`Permission User A -> User B: ${permAB_post} (Expected: true)`);
    console.log(`Permission User B -> User A: ${permBA_post} (Expected: true)`);
    console.log(`Permission User A -> User C: ${permAC_post} (Expected: false)`);
    if (permAB_post !== true || permBA_post !== true || permAC_post !== false) {
      throw new Error('Post-transaction permission assertions failed');
    }

    console.log('Testing getChatRooms Controller post-transaction...');
    const reqRoomsPost = { user: { id: userA._id.toString() } };
    const resRoomsPost = {
      statusCode: null,
      responseData: null,
      status: function (c) { this.statusCode = c; return this; },
      json: function (d) { this.responseData = d; return this; }
    };
    await getChatRooms(reqRoomsPost, resRoomsPost, (err) => { if (err) throw err; });
    console.log(`HTTP Status User A: ${resRoomsPost.statusCode} (Expected: 200)`);
    console.log(`Results User A: ${resRoomsPost.responseData.results} (Expected: 1)`);
    if (resRoomsPost.responseData.results !== 1) throw new Error('User A should have 1 active chat room');

    const roomDetails = resRoomsPost.responseData.data.rooms[0];
    console.log(`Room Participant details: ${roomDetails.user.firstName} ${roomDetails.user.lastName} (${roomDetails.user.email})`);
    console.log(`Room Last Transaction: ID = ${roomDetails.lastTransaction.transactionId}, Amount = ${roomDetails.lastTransaction.amount}`);
    if (roomDetails.user.email !== 'test-chat-b@example.com') throw new Error('Incorrect participant in User A rooms list');
    if (roomDetails.lastTransaction.amount !== 150) throw new Error('Incorrect last transaction amount');

    // Check User B rooms list
    const reqRoomsPostB = { user: { id: userB._id.toString() } };
    const resRoomsPostB = {
      statusCode: null,
      responseData: null,
      status: function (c) { this.statusCode = c; return this; },
      json: function (d) { this.responseData = d; return this; }
    };
    await getChatRooms(reqRoomsPostB, resRoomsPostB, (err) => { if (err) throw err; });
    console.log(`Results User B: ${resRoomsPostB.responseData.results} (Expected: 1)`);
    if (resRoomsPostB.responseData.results !== 1) throw new Error('User B should have 1 active chat room');
    if (resRoomsPostB.responseData.data.rooms[0].user.email !== 'test-chat-a@example.com') {
      throw new Error('Incorrect participant in User B rooms list');
    }

    // Check User C rooms list
    const reqRoomsPostC = { user: { id: userC._id.toString() } };
    const resRoomsPostC = {
      statusCode: null,
      responseData: null,
      status: function (c) { this.statusCode = c; return this; },
      json: function (d) { this.responseData = d; return this; }
    };
    await getChatRooms(reqRoomsPostC, resRoomsPostC, (err) => { if (err) throw err; });
    console.log(`Results User C: ${resRoomsPostC.responseData.results} (Expected: 0)`);
    if (resRoomsPostC.responseData.results !== 0) throw new Error('User C should have 0 active chat rooms');

    console.log('Testing checkPermission Controller post-transaction...');
    const reqPermPost = {
      user: { id: userA._id.toString() },
      params: { targetUserId: userB._id.toString() }
    };
    const resPermPost = {
      statusCode: null,
      responseData: null,
      status: function (c) { this.statusCode = c; return this; },
      json: function (d) { this.responseData = d; return this; }
    };
    await checkPermission(reqPermPost, resPermPost, (err) => { if (err) throw err; });
    console.log(`HTTP Status: ${resPermPost.statusCode} (Expected: 200)`);
    console.log(`hasPermission: ${resPermPost.responseData.data.hasPermission} (Expected: true)`);
    if (resPermPost.responseData.data.hasPermission !== true) throw new Error('Permission API should return true');

    console.log('Simulating Socket join_chat event post-transaction...');
    const socketResPost = await simulateSocketJoinChat(mockSocket, userB._id.toString());
    console.log(`Socket join result: status = ${socketResPost.status}, roomId = "${socketResPost.roomId}" (Expected: success)`);
    if (socketResPost.status !== 'success') throw new Error('Socket join should have succeeded');

    const expectedRoomId = `chat_${[userA._id.toString(), userB._id.toString()].sort().join('_')}`;
    console.log(`Joined Room ID: "${socketResPost.roomId}" (Expected: "${expectedRoomId}")`);
    if (socketResPost.roomId !== expectedRoomId) throw new Error('Socket joined incorrect room ID');
    if (socketJoinedRooms.includes(expectedRoomId) !== true) throw new Error('Socket room join not registered');

  } catch (error) {
    console.error('\n!!! TEST FAILED !!!');
    console.error(error);
    process.exit(1);
  } finally {
    console.log('\nCleaning up test records from database...');
    const testUserMobiles = ['9000000001', '9000000002', '9000000003'];
    const users = await User.find({
      $or: [
        { email: { $in: testUserEmails } },
        { mobile: { $in: testUserMobiles } }
      ]
    });
    const userIds = users.map(u => u._id);

    await Account.deleteMany({ user: { $in: userIds } });
    await Transaction.deleteMany({
      $or: [
        { sender: { $in: userIds } },
        { receiver: { $in: userIds } }
      ]
    });
    await User.deleteMany({ _id: { $in: userIds } });

    await mongoose.disconnect();
    console.log('Disconnected database. Test runner finished.');
  }
}

runChatTests();
