import { z } from 'zod';

export const depositSchema = z.object({
  body: z.object({
    accountNumber: z.string({
      required_error: 'Account number is required',
    }),
    amount: z.number({
      required_error: 'Amount is required',
    }).positive('Amount must be greater than zero'),
    description: z.string().optional(),
    totpToken: z.string().optional(),
  }),
});

export const withdrawSchema = z.object({
  body: z.object({
    accountNumber: z.string({
      required_error: 'Account number is required',
    }),
    amount: z.number({
      required_error: 'Amount is required',
    }).positive('Amount must be greater than zero'),
    description: z.string().optional(),
    totpToken: z.string().optional(),
  }),
});

export const transferSchema = z.object({
  body: z.object({
    receiverId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid receiver user ID format'),
    amount: z.number().min(1, 'Amount must be at least 1'),
    description: z.string().max(100, 'Description must be less than 100 characters').optional(),
    tpin: z.string().length(6, 'TPIN must be exactly 6 digits'),
  }),
});
