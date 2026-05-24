import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { s3Client, useLocalFallback } from '../config/s3.js';
import AppError from './AppError.js';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure local uploads directory exists
if (useLocalFallback && !fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Uploads a file buffer to S3 or stores it locally as a fallback
 * @param {Buffer} fileBuffer 
 * @param {string} originalName 
 * @param {string} mimeType 
 * @returns {Promise<{key: string, location: string}>}
 */
export const uploadToS3 = async (fileBuffer, originalName, mimeType) => {
  const extension = path.extname(originalName);
  const uniqueKey = `${uuidv4()}${extension}`;

  if (useLocalFallback) {
    try {
      const filePath = path.join(UPLOADS_DIR, uniqueKey);
      await fs.promises.writeFile(filePath, fileBuffer);
      
      // Location represents the local relative endpoint
      const location = `/api/v1/uploads/view/${uniqueKey}`;
      return { key: uniqueKey, location };
    } catch (error) {
      throw new AppError(`Local upload fallback failed: ${error.message}`, 500);
    }
  }

  // AWS S3 upload mode
  try {
    const bucketName = process.env.AWS_S3_BUCKET;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueKey,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);
    const location = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;
    return { key: uniqueKey, location };
  } catch (error) {
    throw new AppError(`S3 upload failed: ${error.message}`, 500);
  }
};

/**
 * Generates a pre-signed URL for viewing a file securely
 * @param {string} key 
 * @param {number} expiresInSeconds 
 * @returns {Promise<string>}
 */
export const getPresignedUrlForViewing = async (key, expiresInSeconds = 900) => {
  if (useLocalFallback) {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    const dataToSign = `${key}:${expiresAt}`;
    const hmac = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret-for-signing')
      .update(dataToSign)
      .digest('hex');

    // Return the signed path for local fallback server to verify
    return `/api/v1/uploads/view/${key}?expires=${expiresAt}&signature=${hmac}`;
  }

  // AWS S3 mode
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    return url;
  } catch (error) {
    throw new AppError(`Failed to generate pre-signed URL: ${error.message}`, 500);
  }
};

/**
 * Verifies if a local pre-signed signature is valid and has not expired
 * @param {string} key 
 * @param {string} expires 
 * @param {string} signature 
 * @returns {boolean}
 */
export const verifyLocalSignature = (key, expires, signature) => {
  if (!expires || !signature) return false;

  // Check expiration
  if (Date.now() > parseInt(expires, 10)) {
    return false;
  }

  const dataToSign = `${key}:${expires}`;
  const expectedHmac = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret-for-signing')
    .update(dataToSign)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedHmac, 'hex')
    );
  } catch (err) {
    return false;
  }
};
