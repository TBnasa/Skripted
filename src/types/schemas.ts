import { z } from 'zod';

// Chat Schemas
export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  codeSnippets: z.array(z.string()).optional(),
  reasoning: z.string().optional(),
});

export type MessageInput = z.infer<typeof MessageSchema>;

export const ChatRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  history: z.array(z.any()),
  sessionId: z.string().optional(), // Relaxed from .uuid() to support older browser fallbacks
  currentCode: z.string().optional(),
  serverVersion: z.string().optional(),
  serverType: z.string().optional(),
  skriptVersion: z.string().optional(),
  addons: z.array(z.string()).optional().default([]),
  lang: z.string().optional().default('en'),
});

export type ChatRequestInput = z.infer<typeof ChatRequestSchema>;

export const SessionRequestSchema = z.object({
  sessionId: z.string(),
  title: z.string().max(100).optional(),
  messages: z.array(MessageSchema),
});

export type SessionRequestInput = z.infer<typeof SessionRequestSchema>;

// Gallery Schemas
export const GalleryPostSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır').max(100, 'Başlık çok uzun'),
  description: z.string().max(1000, 'Açıklama çok uzun').optional().nullable(),
  codeSnippet: z.string().min(1, 'Kod alanı boş bırakılamaz').max(20000, 'Kod çok uzun'),
  imageUrls: z.array(z.string().url('Geçerli bir URL giriniz')).max(5, 'En fazla 5 görsel yüklenebilir').default([]),
  category: z.enum(['Economy', 'Admin', 'Minigame', 'Chat', 'Security', 'Other']).default('Other'),
  tags: z.array(z.string()).max(5, 'En fazla 5 etiket eklenebilir').default([]),
});

export type GalleryPostInput = z.infer<typeof GalleryPostSchema>;

export const GalleryCommentSchema = z.object({
  content: z.string().min(2, 'Yorum en az 2 karakter olmalıdır').max(500, 'Yorum çok uzun'),
  parentId: z.string().uuid('Geçerli bir ID giriniz').optional().nullable(),
});

export type GalleryCommentInput = z.infer<typeof GalleryCommentSchema>;

export const GalleryFilterSchema = z.object({
  limit: z.number().int().positive().default(50).optional(),
  filter: z.string().optional(),
  category: z.string().optional(),
  userId: z.string().optional().nullable(),
});

export type GalleryFilterOptions = z.infer<typeof GalleryFilterSchema>;

// Support Schemas
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

// User Script Schemas
export const UserScriptSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir').max(100),
  content: z.string().optional().nullable(),
  version: z.string().optional().default('1.0.0'),
  linked_session_id: z.string().uuid().optional().nullable(),
});

export type UserScriptInput = z.infer<typeof UserScriptSchema>;

// Verify Schemas
export const VerifyRequestSchema = z.object({
  code: z.string().min(1, 'Code is required').max(10_000, 'Code too long for verification'),
});

export type VerifyRequestInput = z.infer<typeof VerifyRequestSchema>;
