import { z } from 'zod';

export const updateRoleSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
  body: z.object({
    role: z.enum(['CUSTOMER', 'CASHIER', 'MANAGER']),
  }),
});
