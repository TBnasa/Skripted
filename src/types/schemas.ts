import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  codeSnippets: z.array(z.string()).optional(),
  reasoning: z.string().optional(),
});

export const ChatRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  history: z.array(z.any()), // We can simplify or use a full Message Schema
  currentCode: z.string().optional(),
  serverVersion: z.string().optional(),
  serverType: z.string().optional(),
  skriptVersion: z.string().optional(),
  addons: z.array(z.string()).optional().default([]), // For Addon Selector
  lang: z.string().optional().default('en'),
});

export const SessionRequestSchema = z.object({
  sessionId: z.string(),
  title: z.string().max(100).optional(),
  messages: z.array(MessageSchema),
});

export const SupportFeedbackSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  message: z.string().min(5, 'Mesaj en az 5 karakter olmalıdır').max(2000, 'Mesaj çok uzun'),
});

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

export const VerifyRequestSchema = z.object({
  code: z.string().min(1, 'Code is required').max(10_000, 'Code too long for verification'),
});

export const GalleryPostSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır').max(100, 'Başlık çok uzun'),
  description: z.string().max(1000, 'Açıklama çok uzun').optional(),
  codeSnippet: z.string().min(1, 'Kod alanı boş bırakılamaz').max(20000, 'Kod çok uzun'),
  imageUrls: z.array(z.string().url()).max(5, 'En fazla 5 görsel yüklenebilir'),
  category: z.enum(['Economy', 'Admin', 'Minigame', 'Chat', 'Security', 'Other']).default('Other'),
  tags: z.array(z.string()).max(5, 'En fazla 5 etiket eklenebilir').default([]),
});

export const UserScriptSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir').max(100),
  content: z.string().min(1, 'İçerik gereklidir'),
  version: z.string().optional().default('1.0.0'),
});
