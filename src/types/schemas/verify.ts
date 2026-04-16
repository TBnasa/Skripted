import { z } from 'zod';

export const VerifyRequestSchema = z.object({
  code: z.string().min(1, 'Code is required').max(10_000, 'Code too long for verification'),
});

export type VerifyRequestInput = z.infer<typeof VerifyRequestSchema>;
