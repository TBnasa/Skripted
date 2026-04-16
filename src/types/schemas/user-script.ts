import { z } from 'zod';

export const UserScriptSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir').max(100),
  content: z.string().min(1, 'İçerik gereklidir'),
  version: z.string().optional().default('1.0.0'),
});

export type UserScriptInput = z.infer<typeof UserScriptSchema>;
