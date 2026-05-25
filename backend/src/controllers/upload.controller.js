import path from 'path';
import fs from 'fs';
import AppError from '../utils/AppError.js';
import {
  uploadToS3,
  getPresignedUrlForViewing,
  verifyLocalSignature,
} from '../utils/s3.helper.js';
import { useLocalFallback } from '../config/s3.js';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

/**
 * Handle Single File Upload
 */
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded or invalid file type', 400));
    }

    // Call S3 helper to upload
    const uploadResult = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Generate pre-signed URL for viewing 
    const presignedUrl = await getPresignedUrlForViewing(uploadResult.key, 900);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        key: uploadResult.key,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: presignedUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Securely Serve Uploaded File (supporting Local Fallback serving & S3 redirection)
 */
export const viewFile = async (req, res, next) => {
  try {
    const { key } = req.params;

    if (useLocalFallback) {
      const { expires, signature } = req.query;

      if (!expires || !signature) {
        return next(
          new AppError(
            'Unauthorized access. Missing required signature credentials.',
            401
          )
        );
      }

      // Verify HMAC signature and expiration
      const isValid = verifyLocalSignature(key, expires, signature);
      if (!isValid) {
        return next(
          new AppError(
            'Unauthorized or expired pre-signed URL signature',
            403
          )
        );
      }

      const filePath = path.join(UPLOADS_DIR, key);

      // Check if file exists locally
      if (!fs.existsSync(filePath)) {
        return next(new AppError('File not found in storage', 404));
      }

      // Send the file securely to browser
      res.sendFile(filePath);
    } else {
      // If AWS S3 is active, redirect to S3 Pre-signed URL directly
      const presignedUrl = await getPresignedUrlForViewing(key, 900);
      res.redirect(presignedUrl);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get Secure URL for viewing (JSON response)
 */
export const getUrl = async (req, res, next) => {
  try {
    const { key } = req.params;
    let url;
    if (useLocalFallback) {
      url = await getPresignedUrlForViewing(key, 900);
    } else {
      url = await getPresignedUrlForViewing(key, 900);
    }
    res.status(200).json({ success: true, url });
  } catch (error) {
    next(error);
  }
};
