import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { streamChatCompletion } from '@/lib/openrouter';
import { searchSkriptExamples, formatRAGContext } from '@/lib/pinecone';
import { buildSystemPrompt } from '@/lib/system-prompt';
import type { ChatRequest } from '@/types';

export const runtime = 'nodejs';

/** Per-user rate limiting: max 30 requests per minute */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Auth guard — prevent unauthenticated access to LLM resources
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit guard
    if (!checkRateLimit(userId)) {
      return Response.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 },
      );
    }

    const body: ChatRequest = await request.json();
    const { prompt, history, serverVersion, serverType, skriptVersion } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return Response.json(
        { error: 'Prompt is required' },
        { status: 400 },
      );
    }

    // Step 1: Initialize SSE logic
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let pineconeIds: string[] = [];
    let ragContext = '';

    // Step 2: Search Pinecone with a timeout safeguard
    const ragStart = performance.now();
    try {
      const searchPromise = searchSkriptExamples(prompt.trim());
      const timeoutPromise = new Promise<[]>((resolve) => setTimeout(() => resolve([]), 5000));
      
      const examples = await Promise.race([searchPromise, timeoutPromise]);
      ragContext = formatRAGContext(examples);
      pineconeIds = examples.map((ex) => ex.id);
      console.log(`[RAG] Search took ${Math.round(performance.now() - ragStart)}ms. Found ${examples.length} examples. Context size: ${ragContext.length} chars.`);
    } catch (e) {
      console.error('[Pinecone RAG Error]:', e);
    }

    // Step 3: Build the system prompt with RAG context + guardrails
    const buildStart = performance.now();
    const systemPrompt = buildSystemPrompt(
      serverVersion,
      serverType,
      skriptVersion,
      ragContext,
    );
    console.log(`[Prompt] Builder took ${Math.round(performance.now() - buildStart)}ms.`);

    // Step 4: Assemble the message list with smart history truncation
    // Limit history depth and truncate large messages (code blocks) to control token usage
    const MAX_HISTORY = 6;
    const MAX_MSG_CHARS = 500;

    const truncatedHistory = history.slice(-MAX_HISTORY).map((msg) => {
      let content = msg.content;
      // Truncate long messages but preserve first part for context
      if (content.length > MAX_MSG_CHARS) {
        content = content.substring(0, MAX_MSG_CHARS) + '\n...[truncated]';
      }
      return {
        role: msg.role as 'user' | 'assistant',
        content,
      };
    });

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...truncatedHistory,
      { role: 'user' as const, content: prompt },
    ];

    // Step 5: Stream from OpenRouter
    const upstreamBody = await streamChatCompletion(messages);

    // Step 6: Transform the SSE stream to extract content deltas
    const transformedStream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        try {
          // Send pinecone metadata immediately
          send({ type: 'meta', pineconeIds });

          const reader = upstreamBody.getReader();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') {
                send({ type: 'done' });
                continue;
              }

              try {
                const parsed = JSON.parse(dataStr);
                const delta = parsed.choices?.[0]?.delta;
                
                if (delta) {
                  // Handle reasoning/thought
                  if (delta.reasoning_content) {
                    send({ type: 'reasoning', content: delta.reasoning_content });
                  } else if (delta.reasoning) {
                    send({ type: 'reasoning', content: delta.reasoning });
                  }

                  // Handle standard content
                  if (delta.content !== undefined && delta.content !== null && delta.content !== '') {
                    send({ type: 'content', content: delta.content });
                  }
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        } catch (error) {
          console.error('[Stream Error]:', error);
          send({ type: 'error', error: String(error) });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown internal error';
    console.error('[Chat API] Error:', error);
    return Response.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 },
    );
  }
}
