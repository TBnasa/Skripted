import { z } from 'zod';

export const SupportFeedbackSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  message: z.string().min(5, 'Mesaj en az 5 karakter olmalıdır').max(2000, 'Mesaj çok uzun'),
});

export type SupportFeedbackInput = z.infer<typeof SupportFeedbackSchema>;

export const FeedbackPayloadSchema = z.union([
  z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    prompt: z.string().min(1, 'Prompt is required'),
    generatedCode: z.string().min(1, 'Generated Code is required'),
    success: z.boolean(),
    errorLog: z.string().optional(),
    consoleOutput: z.string().optional(),
    pineconeIds: z.array(z.string()).optional(),
  }),
  SupportFeedbackSchema,
]);

export type FeedbackPayloadInput = z.infer<typeof FeedbackPayloadSchema>;
