import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.TOTP_ENCRYPTION_KEY, 'hex');
const ivLength = 16;

/**
 * Encrypts text using AES-256-CBC
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text in format iv:encryptedData
 */
export const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts text using AES-256-CBC
 * @param {string} text - The encrypted text in format iv:encryptedData
 * @returns {string} - The decrypted text
 */
export const decrypt = (text) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('No encrypted text provided');
    }

    const parts = text.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }

    const [ivHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');

    if (iv.length !== ivLength) {
      throw new Error('Invalid IV length');
    }

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    // When input is a Buffer, inputEncoding should be null/undefined
    let decrypted = decipher.update(encryptedText, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    throw new Error(`Decryption failed: ${error.message}`);
  }
};
