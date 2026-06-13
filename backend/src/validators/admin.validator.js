import { z } from 'zod';

export const updateRoleSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
  body: z.object({
    role: z.enum(['CUSTOMER', 'CASHIER', 'MANAGER']),
  }),
});

export const updateKycStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
  body: z.object({
    status: z.enum(['VERIFIED', 'REJECTED']),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1').transform(val => parseInt(val, 10)),
    limit: z.string().optional().default('10').transform(val => parseInt(val, 10)),
    role: z.enum(['CUSTOMER', 'CASHIER', 'MANAGER']).optional(),
    kycStatus: z.enum(['NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED']).optional(),
    search: z.string().optional(),
  }).default({}),
});
