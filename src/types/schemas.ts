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
  serverVersion: z.string().optional(),
  serverType: z.string().optional(),
  skriptVersion: z.string().optional(),
  addons: z.array(z.string()).optional().default([]), // For Addon Selector
});

export const SessionRequestSchema = z.object({
  sessionId: z.string(),
  title: z.string().max(100).optional(),
  messages: z.array(MessageSchema),
});

export const FeedbackPayloadSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  generatedCode: z.string().min(1, 'Generated Code is required'),
  success: z.boolean(),
  errorLog: z.string().optional(),
  consoleOutput: z.string().optional(),
  pineconeIds: z.array(z.string()).optional(),
});

export const VerifyRequestSchema = z.object({
  code: z.string().min(1, 'Code is required').max(10_000, 'Code too long for verification'),
});
