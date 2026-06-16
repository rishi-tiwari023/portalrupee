import { z } from 'zod';

const keyRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.[a-zA-Z0-9]+$/;

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits').optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
});

export const searchUserSchema = z.object({
  query: z.object({
    query: z.string().min(1, 'Search query is required'),
  }),
});

export const submitKYCSchema = z.object({
  body: z.object({
    idDocKey: z
      .string({
        required_error: 'Identification document key is required',
      })
      .regex(keyRegex, 'Invalid identification document key format'),
    sigDocKey: z
      .string({
        required_error: 'Signature document key is required',
      })
      .regex(keyRegex, 'Invalid signature document key format'),
  }),
});

export const updateProfileImageSchema = z.object({
  body: z.object({
    profileImageKey: z
      .string({
        required_error: 'Profile image key is required',
      })
      .regex(keyRegex, 'Invalid profile image key format'),
  }),
});
