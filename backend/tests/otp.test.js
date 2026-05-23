import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { connectRedis, redisClient } from '../src/config/redis.js';
import { generateOTP, storeOTP, verifyOTP, isOTPVerified, clearOTPVerification } from '../src/utils/otp.util.js';
import { sendOTPMail } from '../src/utils/mailer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

async function runOtpTests() {
  console.log('--- Starting OTP Service Tests ---');

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    console.log('Connecting to Redis...');
    await connectRedis();
    console.log('Redis connected successfully.');

    const email = 'test-otp-user@example.com';
    const purpose = 'password_reset';

    console.log('\nStep 1: Generating OTP...');
    const otp = generateOTP();
    console.log(`Generated OTP: ${otp}`);
    if (otp.length !== 6 || isNaN(otp)) {
      throw new Error('OTP is not a 6-digit number!');
    }
    console.log('Step 1 Passed.');

    console.log('\nStep 2: Storing OTP in Redis...');
    await storeOTP(email, otp, purpose, 10);
    const stored = await redisClient.get(`otp:${email}:${purpose}`);
    console.log(`Stored OTP in Redis: ${stored}`);
    if (stored !== otp) {
      throw new Error('Stored OTP mismatch!');
    }
    console.log('Step 2 Passed.');

    console.log('\nStep 3: Triggering Nodemailer to send OTP email...');
    const mailResult = await sendOTPMail(email, otp);
    console.log(`Email sent. Message ID: ${mailResult.messageId}`);
    console.log('Step 3 Passed.');

    console.log('\nStep 4: Verifying with incorrect OTP...');
    const verifyWrong = await verifyOTP(email, '000000', purpose);
    console.log(`Verification result for incorrect OTP: ${verifyWrong}`);
    if (verifyWrong === true) {
      throw new Error('Incorrect OTP verified successfully! (Should have failed)');
    }
    console.log('Step 4 Passed.');

    console.log('\nStep 5: Verifying with correct OTP...');
    const verifyCorrect = await verifyOTP(email, otp, purpose);
    console.log(`Verification result for correct OTP: ${verifyCorrect}`);
    if (verifyCorrect !== true) {
      throw new Error('Correct OTP failed verification!');
    }
    console.log('Step 5 Passed.');

    console.log('\nStep 6: Checking verification flag in Redis...');
    const isVerified = await isOTPVerified(email, purpose);
    console.log(`Is verified status: ${isVerified}`);
    if (isVerified !== true) {
      throw new Error('Verification flag not set in Redis!');
    }
    console.log('Step 6 Passed.');

    console.log('\nStep 7: Clearing verification flag...');
    await clearOTPVerification(email, purpose);
    const isVerifiedAfterClear = await isOTPVerified(email, purpose);
    console.log(`Is verified status after clear: ${isVerifiedAfterClear}`);
    if (isVerifiedAfterClear !== false) {
      throw new Error('Verification flag was not cleared!');
    }
    console.log('Step 7 Passed.');

    console.log('\n==================================');
    console.log('ALL OTP TESTS PASSED SUCCESSFULLY!');
    console.log('==================================');

  } catch (error) {
    console.error('\n!!! TEST FAILED !!!');
    console.error(error);
  } finally {
    await mongoose.disconnect();
    await redisClient.quit();
    console.log('\nDisconnected database and Redis. Exiting test.');
  }
}

runOtpTests();
