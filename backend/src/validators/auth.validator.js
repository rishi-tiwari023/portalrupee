import { z } from 'zod';

const passwordComplexity = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
    password: passwordComplexity,
    role: z.enum(['CUSTOMER', 'CASHIER', 'MANAGER']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: passwordComplexity,
  }),
});

export const verify2FASchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    token: z
      .string()
      .length(6, 'OTP token must be exactly 6 digits')
      .regex(/^\d+$/, 'OTP token must only contain numbers'),
  }),
});

export const disable2FALoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const sendOTPSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    purpose: z.enum(['general', 'password_reset', 'tpin_reset', 'disable_2fa']).optional(),
  }),
});

export const verifyOTPSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z
      .string()
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d+$/, 'OTP must only contain numbers'),
    purpose: z.enum(['general', 'password_reset', 'tpin_reset', 'disable_2fa']).optional(),
  }),
});

