import { z } from 'zod';

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
  history: z.array(z.any()), // Keeping z.any() for compatibility with existing history structure if it's complex, or we can use MessageSchema
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
