import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits').optional(),
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
    idDocKey: z.string({
      required_error: 'Identification document key is required',
    }).min(1, 'Identification document key is required'),
    sigDocKey: z.string({
      required_error: 'Signature document key is required',
    }).min(1, 'Signature document key is required'),
  }),
});
