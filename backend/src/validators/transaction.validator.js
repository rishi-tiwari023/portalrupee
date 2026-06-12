import { z } from 'zod';

export const depositSchema = z.object({
  body: z.object({
    accountNumber: z
      .string({
        required_error: 'Account number is required',
      })
      .regex(/^\d{12}$/, 'Account number must be exactly 12 digits'),
    amount: z
      .number({
        required_error: 'Amount is required',
      })
      .positive('Amount must be greater than zero'),
    description: z.string().optional(),
    totpToken: z.string().optional(),
  }),
});

export const withdrawSchema = z.object({
  body: z.object({
    accountNumber: z
      .string({
        required_error: 'Account number is required',
      })
      .regex(/^\d{12}$/, 'Account number must be exactly 12 digits'),
    amount: z
      .number({
        required_error: 'Amount is required',
      })
      .positive('Amount must be greater than zero'),
    description: z.string().optional(),
    totpToken: z.string().optional(),
  }),
});

export const transferSchema = z.object({
  body: z.object({
    receiverId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid receiver user ID format'),
    amount: z.number().min(1, 'Amount must be at least 1'),
    description: z.string().max(100, 'Description must be less than 100 characters').optional(),
    tpin: z
      .string()
      .length(6, 'TPIN must be exactly 6 digits')
      .regex(/^\d+$/, 'TPIN must only contain numbers'),
    totpToken: z.string().optional(),
  }),
});

export const getTransactionHistorySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    type: z.enum(['DEPOSIT', 'WITHDRAW', 'TRANSFER']).optional(),
    status: z.enum(['PENDING', 'SUCCESS', 'FAILED']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    minAmount: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxAmount: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    search: z.string().optional(),
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format').optional(),
  }),
});

export const generateStatementSchema = z.object({
  query: z.object({
    accountId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid account ID format').optional(),
    startDate: z.string({
      required_error: 'Start date is required',
    }),
    endDate: z.string({
      required_error: 'End date is required',
    }),
  }),
});
