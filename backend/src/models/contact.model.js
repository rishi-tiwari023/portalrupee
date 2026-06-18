import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxLength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxLength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxLength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['NEW', 'READ', 'RESOLVED'],
      default: 'NEW',
    },
  },
  {
    timestamps: true,
  }
);

// Index for filtering by status and sorting by creation date
contactSchema.index({ status: 1, createdAt: -1 });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
