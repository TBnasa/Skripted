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

    // Step 1: Search Pinecone for relevant Skript examples
    const examples = await searchSkriptExamples(prompt.trim());
    const ragContext = formatRAGContext(examples);
    const pineconeIds = examples.map((ex) => ex.id);

    // Step 2: Build the system prompt with RAG context + guardrails
    const systemPrompt = buildSystemPrompt(
      serverVersion,
      serverType,
      skriptVersion,
      ragContext,
    );

    // Step 3: Assemble the message list
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      // Include recent conversation history (last 10 exchanges)
      ...history.slice(-10).map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: prompt },
    ];

    // Step 4: Stream from OpenRouter
    const upstreamBody = await streamChatCompletion(messages);

    // Step 5: Transform the SSE stream to extract content deltas
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformedStream = new ReadableStream({
      async start(controller) {
        // Send pinecone metadata as the first chunk
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'meta', pineconeIds })}\n\n`),
        );

        const reader = upstreamBody.getReader();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'content', content })}\n\n`),
                  );
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }
        } catch (error) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: String(error) })}\n\n`),
          );
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
