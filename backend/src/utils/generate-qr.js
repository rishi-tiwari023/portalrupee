import dotenv from 'dotenv';
import mongoose from 'mongoose';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import readline from 'readline';
import User from '../models/user.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from the backend root folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const decrypt = (encryptedText) => {
  const TOTP_ENCRYPTION_KEY = process.env.TOTP_ENCRYPTION_KEY;
  if (!TOTP_ENCRYPTION_KEY) {
    throw new Error('TOTP_ENCRYPTION_KEY is not defined in environment variables');
  }

  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encryptedData = parts[1];

  const keyBuffer = Buffer.from(TOTP_ENCRYPTION_KEY, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

const run = async () => {
  rl.question('Enter the email address for QR code generation: ', async (email) => {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      
      if (!MONGODB_URI) {
          throw new Error('MONGODB_URI is not defined in environment variables');
      }

      await mongoose.connect(MONGODB_URI);
      
      const user = await User.findOne({ email: email.trim() }).select('+twoFactorSecret');
      
      if (!user) {
        console.log('User not found');
        process.exit(0);
      }
      
      if (!user.twoFactorSecret) {
        console.log('2FA not set up for this user.');
        process.exit(0);
      }
      
      const secret = decrypt(user.twoFactorSecret);
      
      const otpauthUrl = speakeasy.otpauthURL({
        secret: secret,
        label: `PortalRupee:${user.email}`,
        issuer: 'PortalRupee',
        encoding: 'base32',
      });
      
      QRCode.toString(otpauthUrl, { type: 'terminal', small: true }, function (err, url) {
        if(err) console.error(err);
        console.log('=== QR Code ===');
        console.log(url);
        console.log('=== Manual Setup Secret ===');
        console.log(secret);
        process.exit(0);
      });
    } catch (err) {
      console.error('Error:', err);
      process.exit(1);
    }
  });
};

run();
