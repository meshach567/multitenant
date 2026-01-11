import { z } from 'zod';

export const businessSchema = z.object({
  name: z.string().min(2, 'Business name is required'),
  timezone: z.string().min(1),
  currency: z.string().min(1),
});

export type BusinessInput = z.infer<typeof businessSchema>;
