import { z } from 'zod';

export const createAccountSchema = z.object({
  body: z.object({
    accountType: z.enum(['SAVINGS', 'CURRENT'], {
      required_error: 'Account type is required',
      invalid_type_error: 'Account type must be SAVINGS or CURRENT',
    }),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'BLOCKED', 'CLOSED'], {
      required_error: 'Status is required',
      invalid_type_error: 'Status must be ACTIVE, BLOCKED, or CLOSED',
    }),
  }),
});

export const getAccountByNumberSchema = z.object({
  params: z.object({
    accountNumber: z.string().regex(/^\d{10}$/, 'Account number must be exactly 10 digits'),
  }),
});

export const getAccountDetailsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid account ID format'),
  }),
});

export const getAccountBalanceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid account ID format'),
  }),
  body: z.object({
    totpToken: z.string().length(6, 'TOTP Token must be exactly 6 digits').regex(/^\d+$/, 'TOTP must only contain numbers').optional()
  }).optional()
});

