// schemas/reset-password.schema.ts
import { z } from 'zod';

export const resetPasswordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
