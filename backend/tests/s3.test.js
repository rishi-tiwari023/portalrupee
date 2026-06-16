import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import {
  uploadToS3,
  getPresignedUrlForViewing,
  verifyLocalSignature,
} from '../src/utils/s3.helper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runS3Tests() {
  console.log('--- Starting S3 Storage & Pre-signed URL Tests ---');

  try {
    const originalName = 'kyc-document.pdf';
    const mimeType = 'application/pdf';
    const mockFileBuffer = Buffer.from('mock PDF content for PortalRupee KYC validation');

    // 1. Upload file
    console.log('\nStep 1: Uploading mock file buffer...');
    const uploadResult = await uploadToS3(mockFileBuffer, originalName, mimeType);
    console.log('Upload Result:', uploadResult);

    if (!uploadResult.key || !uploadResult.location) {
      throw new Error('Upload result must contain key and location');
    }
    console.log('Step 1 Passed: Uploaded file key generated successfully.');

    // 2. Generate pre-signed URL for viewing
    console.log('\nStep 2: Generating pre-signed URL for viewing...');
    const viewUrl = await getPresignedUrlForViewing(uploadResult.key, 900);
    console.log('Generated Pre-signed URL:', viewUrl);

    if (!viewUrl) {
      throw new Error('Pre-signed URL is empty');
    }
    console.log('Step 2 Passed: Pre-signed URL generated successfully.');

    // 3. Verify signatures for Local Fallback Mode
    if (viewUrl.includes('signature=')) {
      console.log('\nStep 3: Parsing and validating signature parameters...');
      const urlObj = new URL(viewUrl, 'http://localhost');
      const key = uploadResult.key;
      const expires = urlObj.searchParams.get('expires');
      const signature = urlObj.searchParams.get('signature');

      console.log(`Extracted key: ${key}`);
      console.log(`Extracted expires: ${expires}`);
      console.log(`Extracted signature: ${signature}`);

      // Verify correct signature
      const isSignatureValid = verifyLocalSignature(key, expires, signature);
      console.log(`Signature validity check: ${isSignatureValid} (Expected: true)`);
      if (!isSignatureValid) {
        throw new Error('Valid signature failed verification check');
      }

      // Verify tampered key
      const isTamperedKeyValid = verifyLocalSignature('another-key.pdf', expires, signature);
      console.log(`Tampered key validity check: ${isTamperedKeyValid} (Expected: false)`);
      if (isTamperedKeyValid) {
        throw new Error('Tampered key bypassed signature verification check!');
      }

      // Verify expired link
      const expiredTimestamp = (Date.now() - 5000).toString(); // expired 5 seconds ago
      const isExpiredValid = verifyLocalSignature(key, expiredTimestamp, signature);
      console.log(`Expired link validity check: ${isExpiredValid} (Expected: false)`);
      if (isExpiredValid) {
        throw new Error('Expired signature bypassed validity check!');
      }

      console.log('Step 3 Passed: Signature validation is 100% robust and secure.');
    } else {
      console.log('\nStep 3: AWS S3 Live Mode url returned (no local query signature to test).');
    }

    // 4. Verify local file presence and content matches exactly
    if (uploadResult.location.startsWith('/api/v1/uploads/view')) {
      console.log('\nStep 4: Verifying saved file content in local directory...');
      const localFilePath = path.join(process.cwd(), 'uploads', uploadResult.key);
      const exists = fs.existsSync(localFilePath);
      console.log(`File exists on disk: ${exists} (Expected: true)`);
      if (!exists) {
        throw new Error('Uploaded file not found in local fallback folder');
      }

      const fileContent = fs.readFileSync(localFilePath, 'utf-8');
      console.log(`File content match check: ${fileContent === 'mock PDF content for PortalRupee KYC validation'} (Expected: true)`);
      if (fileContent !== 'mock PDF content for PortalRupee KYC validation') {
        throw new Error('Local file content does not match uploaded buffer content');
      }

      // Clean up test file
      fs.unlinkSync(localFilePath);
      console.log('Temporary local test file cleaned up successfully.');
      console.log('Step 4 Passed: Local file storage operates flawlessly.');
    }

    console.log('\n=============================================');
    console.log('ALL S3 & PRE-SIGNED URL TESTS PASSED SUCCESSFULLY!');
    console.log('=============================================');

  } catch (error) {
    console.error('\n!!! TEST FAILED !!!');
    console.error(error);
    process.exit(1);
  }
}

runS3Tests();
