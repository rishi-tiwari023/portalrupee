import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/user.model.js';
import { login, register } from '../src/controllers/auth.controller.js';
import { updateProfileImage } from '../src/controllers/user.controller.js';
import { updateProfileImageSchema } from '../src/validators/user.validator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

async function runUserProfileTests() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    const email = 'test-user@portalrupee.in';
    const mockProfileImageKey = '11111111-2222-3333-4444-555555555555.jpg';

    // 1. Cleanup existing test user
    await User.deleteOne({ email });

    console.log('\n--- Test 1: lastLogin upon Registration ---');
    const registerReq = {
      body: {
        firstName: 'Mr. Test',
        lastName: 'Verifier',
        email,
        mobile: '9015124393',
        password: 'securePassword123',
        role: 'CUSTOMER'
      }
    };

    let responseData = null;
    const mockRes = {
      cookie: () => {},
      status: function (code) { return this; },
      json: function (data) { responseData = data; return this; }
    };
    const mockNext = (err) => { if(err) throw err; };

    await register(registerReq, mockRes, mockNext);
    const userId = responseData.data.user._id;

    let dbUser = await User.findById(userId);
    if (!dbUser.lastLogin) {
      throw new Error('Registration should set lastLogin field!');
    }
    console.log('Test 1 Passed: lastLogin is set upon registration.');

    console.log('\n--- Test 2: lastLogin update upon Login ---');
    // Save old lastLogin to ensure it updates
    const oldLastLogin = dbUser.lastLogin.getTime();
    
    // Artificial delay to ensure timestamp differs
    await new Promise(r => setTimeout(r, 1000));

    const loginReq = {
      body: { email, password: 'securePassword123' }
    };

    await login(loginReq, mockRes, mockNext);
    dbUser = await User.findById(userId);

    const newLastLogin = dbUser.lastLogin.getTime();
    if (newLastLogin <= oldLastLogin) {
      throw new Error('Login should update lastLogin field to a newer timestamp!');
    }
    console.log('Test 2 Passed: lastLogin updated upon login.');

    console.log('\n--- Test 3: updateProfileImageSchema validation ---');
    const invalidPayload = { body: { profileImageKey: 'invalid-key' } };
    const validationResult1 = updateProfileImageSchema.safeParse(invalidPayload);
    if (validationResult1.success) {
      throw new Error('Zod validator failed to catch invalid profileImageKey format!');
    }
    
    const validPayload = { body: { profileImageKey: mockProfileImageKey } };
    const validationResult2 = updateProfileImageSchema.safeParse(validPayload);
    if (!validationResult2.success) {
      throw new Error('Zod validator failed on a valid profileImageKey payload!');
    }
    console.log('Test 3 Passed: Profile image validation schema works.');

    console.log('\n--- Test 4: updateProfileImage Controller ---');
    const updateReq = {
      user: { id: userId.toString() },
      body: { profileImageKey: mockProfileImageKey }
    };

    await updateProfileImage(updateReq, mockRes, mockNext);
    
    dbUser = await User.findById(userId);
    if (dbUser.profileImageKey !== mockProfileImageKey) {
      throw new Error('Controller failed to update profileImageKey in DB!');
    }
    console.log('Test 4 Passed: Controller updated profileImageKey successfully.');

    // Cleanup test user
    await User.deleteOne({ email });
    console.log('\nAll User Profile tests completed successfully.');
  } catch (error) {
    console.error('\n!!! TEST FAILED !!!');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected database. Exiting.');
  }
}

runUserProfileTests();
