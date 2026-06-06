import { sendOTPMail } from '../src/utils/mailer.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the root backend .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testOTPSpeed() {
  console.log('Testing OTP Delivery Speed using Resend...');
  const start = performance.now();
  
  try {
    // You must provide a valid verified email address here or Resend will fail if domain isn't verified
    const testEmail = process.env.TEST_EMAIL || 'test@example.com'; 
    const otp = '123456';
    const purpose = 'general';
    
    // Ensure EMAIL_FROM is set so mailer.js doesn't fail
    if (!process.env.EMAIL_FROM) {
      process.env.EMAIL_FROM = 'noreply@portalrupee.com';
    }
    
    await sendOTPMail(testEmail, otp, purpose);
    
    const end = performance.now();
    const duration = end - start;
    
    console.log('[SUCCESS] OTP Email dispatched successfully.');
    console.log(`[INFO] Delivery API response time: ${duration.toFixed(2)} ms`);
    
    if (duration < 1000) {
      console.log('[PERFORMANCE] Excellent performance! (Under 1 second)');
    } else if (duration < 3000) {
      console.log('[PERFORMANCE] Good performance. (1-3 seconds)');
    } else {
      console.log('[PERFORMANCE] Fair performance. (Over 3 seconds)');
    }
  } catch (error) {
    console.error('[ERROR] Failed to send OTP:', error);
  }
  
  process.exit(0);
}

testOTPSpeed();
