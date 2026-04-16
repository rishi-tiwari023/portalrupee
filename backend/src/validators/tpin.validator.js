import { z } from 'zod';

export const setTPINSchema = z.object({
  body: z.object({
    tpin: z
      .string()
      .length(6, 'TPIN must be exactly 6 digits')
      .regex(/^\d+$/, 'TPIN must only contain numbers'),
  }),
});

export const changeTPINSchema = z.object({
  body: z.object({
    oldTPIN: z
      .string()
      .length(6, 'Old TPIN must be exactly 6 digits')
      .regex(/^\d+$/, 'Old TPIN must only contain numbers'),
    newTPIN: z
      .string()
      .length(6, 'New TPIN must be exactly 6 digits')
      .regex(/^\d+$/, 'New TPIN must only contain numbers'),
  }),
});
