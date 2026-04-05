/* ═══════════════════════════════════════════
   Skripted — RAG Chat API Route
   Flow: User Prompt → Pinecone Search → OpenRouter Stream
   ═══════════════════════════════════════════ */

import { NextRequest } from 'next/server';
import { streamChatCompletion } from '@/lib/openrouter';
import { searchSkriptExamples, formatRAGContext } from '@/lib/pinecone';
import { buildSystemPrompt } from '@/lib/system-prompt';
import type { ChatRequest } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<Response> {
  try {
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
    try {
      const searchPromise = searchSkriptExamples(prompt.trim());
      const timeoutPromise = new Promise<[]>((resolve) => setTimeout(() => resolve([]), 5000));
      
      const examples = await Promise.race([searchPromise, timeoutPromise]);
      ragContext = formatRAGContext(examples);
      pineconeIds = examples.map((ex) => ex.id);
    } catch (e) {
      console.error('[Pinecone RAG Error]:', e);
    }

    // Step 3: Build the system prompt with RAG context + guardrails
    const systemPrompt = buildSystemPrompt(
      serverVersion,
      serverType,
      skriptVersion,
      ragContext,
    );

    // Step 4: Assemble the message list
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      // Include recent conversation history (last 10 exchanges)
      ...history.slice(-10).map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
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
                const content = parsed.choices?.[0]?.delta?.content;
                if (content !== undefined && content !== null) {
                  send({ type: 'content', content });
                }
              } catch (e) {
                // Ignore parsing errors for non-JSON lines or heartbeats
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
