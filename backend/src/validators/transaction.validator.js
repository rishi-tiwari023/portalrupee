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
