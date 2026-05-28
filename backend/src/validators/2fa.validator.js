import { z } from 'zod';

export const toggle2FASchema = z.object({
  body: z.object({
    token: z
      .string()
      .length(6, 'OTP token must be exactly 6 digits')
      .regex(/^\d+$/, 'OTP token must only contain numbers'),
  }),
});
