import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const isS3Configured = () => {
  return (
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET
  );
};

const useLocalFallback = 
  process.env.USE_LOCAL_S3_FALLBACK === 'true' || 
  !isS3Configured();

let s3Client = null;

if (!useLocalFallback) {
  try {
    s3Client = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });
    console.log('AWS S3 Client Initialized Successfully.');
  } catch (error) {
    console.error('Error initializing AWS S3 Client, falling back to local storage:', error.message);
  }
} else {
  console.log('Using Local Storage Fallback for uploads (AWS S3 not fully configured or fallback explicitly enabled).');
}

export { s3Client, useLocalFallback };
export default s3Client;
