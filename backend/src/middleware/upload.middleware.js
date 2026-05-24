import multer from 'multer';
import AppError from '../utils/AppError.js';

const storage = multer.memoryStorage();

// File filter for KYC documents (Images and PDFs)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed.',
        400
      ),
      false
    );
  }
};

// Configure multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
