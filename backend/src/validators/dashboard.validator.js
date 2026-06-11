import { z } from 'zod';

export const getAnalyticsSchema = z.object({
  query: z.object({
    timeRange: z.enum(['7d', '30d', '12m', 'custom']).optional().default('30d'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).refine(
    (data) => {
      if (data.timeRange === 'custom' && (!data.startDate || !data.endDate)) {
        return false;
      }
      return true;
    },
    {
      message: "startDate and endDate are required when timeRange is 'custom'",
      path: ['startDate'],
    }
  ),
});
