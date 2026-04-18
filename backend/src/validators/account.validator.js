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
