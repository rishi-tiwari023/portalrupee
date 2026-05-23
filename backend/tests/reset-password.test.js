import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { connectRedis, redisClient } from '../src/config/redis.js';
import { generateOTP, storeOTP, verifyOTP, isOTPVerified } from '../src/utils/otp.util.js';
import User from '../src/models/user.model.js';
import { resetPassword } from '../src/controllers/auth.controller.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

async function runResetPasswordTests() {
  console.log('--- Starting Reset Password Controller Tests ---');

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    console.log('Connecting to Redis...');
    await connectRedis();
    console.log('Redis connected successfully.');

    const email = 'test-reset-user@example.com';
    const originalPassword = 'oldSecurePassword123';
    const newPassword = 'newSecurePassword456';
    const purpose = 'password_reset';

    // Cleanup existing test user if any
    await User.deleteOne({ email });

    // Create test user
    console.log('\nCreating test user in MongoDB...');
    const user = await User.create({
      firstName: 'Test',
      lastName: 'Reset',
      email,
      mobile: '9999999999',
      password: originalPassword,
      role: 'CUSTOMER'
    });
    console.log('Test user created.');

    // 1. Try to reset password without OTP verification
    console.log('\nTesting reset password without OTP verification (should fail)...');
    let mockReq = { body: { email, password: newPassword } };
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

    await resetPassword(mockReq, mockRes, mockNext);
    if (!nextCalled || !nextError || nextError.statusCode !== 400) {
      throw new Error(`Expected verification check to fail, but it succeeded or returned wrong error: ${nextError?.message}`);
    }
    console.log('Successfully rejected reset without OTP.');

    // 2. Generate and verify OTP
    console.log('\nGenerating and verifying OTP...');
    const otp = generateOTP();
    await storeOTP(email, otp, purpose, 300);
    const otpVerified = await verifyOTP(email, otp, purpose);
    if (!otpVerified) {
      throw new Error('Failed to verify OTP');
    }
    console.log('OTP verified successfully. Verification flag set.');

    // 3. Try to reset password with verified OTP
    console.log('\nTesting reset password with valid OTP verification...');
    nextCalled = false;
    nextError = null;
    mockRes.statusCode = null;
    mockRes.responseData = null;

    await resetPassword(mockReq, mockRes, mockNext);
    if (nextCalled && nextError) {
      throw new Error(`Expected reset password to succeed, but next was called with error: ${nextError.message}`);
    }

    if (mockRes.statusCode !== 200 || !mockRes.responseData.success) {
      throw new Error(`Expected HTTP 200 success response, got: ${mockRes.statusCode}`);
    }
    console.log('Reset password controller completed successfully.');

    // 4. Verify password was updated and hashed in DB
    console.log('\nVerifying updated password in MongoDB...');
    const updatedUser = await User.findOne({ email }).select('+password');
    const isOldMatch = await bcrypt.compare(originalPassword, updatedUser.password);
    const isNewMatch = await bcrypt.compare(newPassword, updatedUser.password);

    console.log(`Compare with old password: ${isOldMatch} (expected: false)`);
    console.log(`Compare with new password: ${isNewMatch} (expected: true)`);

    if (isOldMatch || !isNewMatch) {
      throw new Error('Password was not correctly updated/hashed in the database!');
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
    console.log('ALL RESET PASSWORD TESTS PASSED SUCCESSFULLY!');
    console.log('======================================');

    // Cleanup test user
    await User.deleteOne({ email });

  } catch (error) {
    console.error('\n!!! TEST FAILED !!!');
    console.error(error);
  } finally {
    await mongoose.disconnect();
    await redisClient.quit();
    console.log('\nDisconnected databases. Exiting.');
  }
}

runResetPasswordTests();
