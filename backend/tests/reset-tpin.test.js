import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import net from 'net';
import { connectRedis, redisClient } from '../src/config/redis.js';
import { generateOTP, storeOTP, verifyOTP, isOTPVerified } from '../src/utils/otp.util.js';
import User from '../src/models/user.model.js';
import { resetTPIN } from '../src/controllers/tpin.controller.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const checkRedisRunning = (url) => {
  return new Promise((resolve) => {
    let port = 6379;
    let host = '127.0.0.1';
    try {
      const parsed = new URL(url);
      port = parsed.port || 6379;
      host = parsed.hostname || '127.0.0.1';
    } catch (e) {}

    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
};

// In-memory Redis mock fallback
const mockStore = {};
const setupRedisMock = () => {
  console.log('Setting up in-memory Redis mock fallback for tests...');
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

async function runResetTPINTests() {
  console.log('--- Starting Reset TPIN Controller Tests ---');

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    const redisRunning = await checkRedisRunning(process.env.REDIS_URL || 'redis://localhost:6379');
    if (redisRunning) {
      console.log('Connecting to Redis...');
      await connectRedis();
      console.log('Redis connected successfully.');
    } else {
      console.warn('Redis is not running. Setting up mock Redis fallback.');
      setupRedisMock();
    }


    const email = 'test-tpin-user@example.com';
    const initialTpin = '123456';
    const newTpin = '987654';
    const purpose = 'tpin_reset';

    // Cleanup existing test user if any
    await User.deleteOne({ email });

    // Create test user
    console.log('\nCreating test user in MongoDB...');
    const user = await User.create({
      firstName: 'Test',
      lastName: 'TPIN',
      email,
      mobile: '8888888888',
      password: 'securePassword123',
      role: 'CUSTOMER',
      tpin: initialTpin
    });
    console.log('Test user created.');

    // 1. Try to reset TPIN without OTP verification
    console.log('\nTesting reset TPIN without OTP verification (should fail)...');
    let mockReq = {
      body: { tpin: newTpin },
      user: {
        id: user._id,
        email: user.email
      }
    };
    let mockRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.responseData = data;
        return this;
      }
    };
    let nextCalled = false;
    let nextError = null;
    let mockNext = (err) => {
      nextCalled = true;
      nextError = err;
    };

    await resetTPIN(mockReq, mockRes, mockNext);
    if (!nextCalled || !nextError || nextError.statusCode !== 400) {
      throw new Error(`Expected verification check to fail, but it succeeded or returned wrong error: ${nextError?.message}`);
    }
    console.log('Successfully rejected reset without OTP verification.');

    // 2. Generate and verify OTP
    console.log('\nGenerating and verifying OTP...');
    const otp = generateOTP();
    await storeOTP(email, otp, purpose, 300);
    const otpVerified = await verifyOTP(email, otp, purpose);
    if (!otpVerified) {
      throw new Error('Failed to verify OTP');
    }
    console.log('OTP verified successfully. Verification flag set.');

    // 3. Reset TPIN with verified OTP
    console.log('\nTesting reset TPIN with valid OTP verification...');
    nextCalled = false;
    nextError = null;
    mockRes.statusCode = null;
    mockRes.responseData = null;

    await resetTPIN(mockReq, mockRes, mockNext);
    if (nextCalled && nextError) {
      throw new Error(`Expected reset TPIN to succeed, but next was called with error: ${nextError.message}`);
    }

    if (mockRes.statusCode !== 200 || mockRes.responseData.status !== 'success') {
      throw new Error(`Expected HTTP 200 success response, got: ${mockRes.statusCode}`);
    }
    console.log('Reset TPIN controller completed successfully.');

    // 4. Verify TPIN was updated and hashed in DB
    console.log('\nVerifying updated TPIN in MongoDB...');
    const updatedUser = await User.findOne({ email }).select('+tpin');
    const isOldMatch = await bcrypt.compare(initialTpin, updatedUser.tpin);
    const isNewMatch = await bcrypt.compare(newTpin, updatedUser.tpin);

    console.log(`Compare with old TPIN: ${isOldMatch} (expected: false)`);
    console.log(`Compare with new TPIN: ${isNewMatch} (expected: true)`);
    console.log(`tpinSet status: ${updatedUser.tpinSet} (expected: true)`);

    if (isOldMatch || !isNewMatch || !updatedUser.tpinSet) {
      throw new Error('TPIN was not correctly updated/hashed in the database!');
    }
    console.log('Database verification passed.');

    // 5. Verify OTP verification flag was cleared in Redis
    console.log('\nVerifying OTP verification flag was cleared in Redis...');
    const verifiedStatus = await isOTPVerified(email, purpose);
    console.log(`Verification status in Redis: ${verifiedStatus} (expected: false)`);
    if (verifiedStatus !== false) {
      throw new Error('Verification flag was not cleared after reset!');
    }
    console.log('Redis flag verification passed.');

    console.log('\n======================================');
    console.log('ALL RESET TPIN TESTS PASSED SUCCESSFULLY!');
    console.log('======================================');

    // Cleanup test user
    await User.deleteOne({ email });

  } catch (error) {
    console.error('\n!!! TEST FAILED !!!');
    console.error(error);
  } finally {
    await mongoose.disconnect();
    try {
      await redisClient.quit();
    } catch (e) {}
    console.log('\nDisconnected databases. Exiting.');
  }
}

runResetTPINTests();
