import { z } from 'zod';

const keyRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.[a-zA-Z0-9]+$/;

export const viewFileSchema = z.object({
  params: z.object({
    key: z.string().regex(keyRegex, 'Invalid file key format'),
  }),
});

export const getUrlSchema = z.object({
  params: z.object({
    key: z.string().regex(keyRegex, 'Invalid file key format'),
  }),
});
