import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/user.model.js';
import { submitKYC } from '../src/controllers/user.controller.js';
import { submitKYCSchema } from '../src/validators/user.validator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

async function runKycTests() {
  console.log('--- Starting Day 17 KYC Document Upload Controller & Validator Tests ---');

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    const email = 'test-kyc-user@example.com';
    const mockIdDocKey = 'kyc-identity-key-12345.pdf';
    const mockSigDocKey = 'kyc-signature-key-54321.png';

    // 1. Cleanup existing test user
    await User.deleteOne({ email });

    // 2. Create test user
    console.log('\nCreating a new test user...');
    const user = await User.create({
      firstName: 'Test',
      lastName: 'KYC',
      email,
      mobile: '9888888888',
      password: 'securePassword123',
      role: 'CUSTOMER',
    });
    console.log('Test user created.');

    // 3. Verify initial schema defaults
    console.log('\nVerifying initial KYC fields in schema...');
    console.log(`Initial kycStatus: ${user.kycStatus} (Expected: NOT_STARTED)`);
    if (user.kycStatus !== 'NOT_STARTED') {
      throw new Error('Initial kycStatus must be NOT_STARTED');
    }
    if (user.kycDocumentKey || user.kycSignatureKey) {
      throw new Error('Initial document/signature S3 keys must be empty');
    }
    console.log('Initial schema assertion Passed.');

    // 4. Test Zod Validation Schema
    console.log('\nStep 1: Testing Zod Validation Schema...');

    // Test empty/missing fields
    const invalidPayload = { body: { idDocKey: mockIdDocKey } }; // sigDocKey is missing
    const validationResult1 = submitKYCSchema.safeParse(invalidPayload);
    console.log(`Validation result for missing sigDocKey: success = ${validationResult1.success} (Expected: false)`);
    if (validationResult1.success) {
      throw new Error('Zod validator failed to catch missing signature document key!');
    }

    // Test valid fields
    const validPayload = { body: { idDocKey: mockIdDocKey, sigDocKey: mockSigDocKey } };
    const validationResult2 = submitKYCSchema.safeParse(validPayload);
    console.log(`Validation result for valid payload: success = ${validationResult2.success} (Expected: true)`);
    if (!validationResult2.success) {
      throw new Error('Zod validator failed to approve a valid KYC submission payload!');
    }
    console.log('Step 1 (Zod Validation) Passed.');

    // 5. Test Controller submitKYC Method
    console.log('\nStep 2: Testing submitKYC Controller Method...');

    const mockReq = {
      user: { id: user._id.toString() },
      body: { idDocKey: mockIdDocKey, sigDocKey: mockSigDocKey }
    };
    const mockRes = {
      statusCode: null,
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

    let nextCalled = false;
    let nextError = null;
    const mockNext = (err) => {
      nextCalled = true;
      nextError = err;
    };

    await submitKYC(mockReq, mockRes, mockNext);

    if (nextCalled && nextError) {
      throw new Error(`Expected submitKYC controller to succeed, but next was called with error: ${nextError.message}`);
    }

    if (mockRes.statusCode !== 200 || mockRes.responseData.status !== 'success') {
      throw new Error(`Expected HTTP 200 success response, got status: ${mockRes.statusCode}`);
    }
    console.log('Controller completed execution and returned successfully.');
    console.log('Step 2 (Controller Execution) Passed.');

    // 6. Verify Database State
    console.log('\nStep 3: Verifying database state updates...');
    const updatedUser = await User.findById(user._id);

    console.log(`Updated kycStatus: ${updatedUser.kycStatus} (Expected: PENDING)`);
    console.log(`Updated kycDocumentKey: ${updatedUser.kycDocumentKey} (Expected: ${mockIdDocKey})`);
    console.log(`Updated kycSignatureKey: ${updatedUser.kycSignatureKey} (Expected: ${mockSigDocKey})`);

    if (updatedUser.kycStatus !== 'PENDING') {
      throw new Error('kycStatus was not updated to PENDING in database!');
    }
    if (updatedUser.kycDocumentKey !== mockIdDocKey || updatedUser.kycSignatureKey !== mockSigDocKey) {
      throw new Error('KYC document/signature keys in database mismatch requested keys!');
    }
    console.log('Step 3 (Database Verification) Passed.');

    // Cleanup test user
    await User.deleteOne({ email });

  } catch (error) {
    console.error('\n!!! TEST FAILED !!!');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected database. Exiting.');
  }
}

runKycTests();
