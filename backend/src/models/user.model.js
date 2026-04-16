import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    tpin: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'CASHIER', 'MANAGER'],
      default: 'CUSTOMER',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password and TPIN before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  if (this.isModified('tpin')) {
    this.tpin = await bcrypt.hash(this.tpin, 12);
  }

  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to compare TPIN
userSchema.methods.compareTPIN = async function (
  candidateTPIN,
  userTPIN
) {
  return await bcrypt.compare(candidateTPIN, userTPIN);
};

const User = mongoose.model('User', userSchema);
export default User;
