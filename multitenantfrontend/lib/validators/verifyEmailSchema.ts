// schemas/verify-email.schema.ts
import { z } from 'zod';

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
