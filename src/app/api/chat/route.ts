import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { streamChatCompletion } from '@/lib/openrouter';
import { ChatService } from '@/services/server/chat-service';
import { checkUsageLimit, incrementUsage } from '@/lib/utils/usage-limit';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { ChatRequestSchema } from '@/types/schemas';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { StorageArchiver } from '@/lib/storage-archiver';

const CHAT_RATE_LIMIT = { windowMs: 60_000, max: 30 };

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!checkRateLimit(`chat:${userId}`, CHAT_RATE_LIMIT).success) {
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // --- Usage Limit Enforcement ---
    const usage = await checkUsageLimit(userId);
    if (!usage.allowed) {
      return Response.json({ 
        error: 'Daily limit reached. Upgrade to Pro (Coming Soon) for unlimited access.',
        code: 'LIMIT_REACHED'
      }, { status: 429 });
    }
    // -------------------------------

    const rawBody = await request.json();
    const result = ChatRequestSchema.safeParse(rawBody);

    if (!result.success) {
      return Response.json({ error: 'Invalid data', details: result.error.format() }, { status: 400 });
    }

    const { prompt, history, sessionId, serverVersion, serverType, skriptVersion, addons, currentCode, lang } = result.data;

    const { systemPrompt, pineconeIds } = await ChatService.prepareChatContext(prompt, {
      serverVersion,
      serverType,
      skriptVersion,
      addons,
      lang,
      userTier: usage.tier,
    });

    const truncatedHistory = ChatService.truncateHistory(history);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...truncatedHistory,
    ];

    // Inject editor context if available to keep the AI aware of the current code
    if (currentCode && currentCode.trim()) {
      messages.push({
        role: 'user' as const,
        content: `[CONTEXT] Current Editor Content:\n\`\`\`sk\n${currentCode}\n\`\`\``,
      });
    }

    messages.push({ role: 'user' as const, content: prompt });

    const upstreamBody = await streamChatCompletion(messages);
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformedStream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        let fullAiResponse = '';
        try {
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
                  if (delta.reasoning_content || delta.reasoning) {
                    send({ type: 'reasoning', content: delta.reasoning_content || delta.reasoning });
                  }
                  if (delta.content) {
                    fullAiResponse += delta.content;
                    send({ type: 'content', content: delta.content });
                  }
                }
              } catch (e) {}
            }
          }

          // Persistence Logic
          if (sessionId) {
            try {
              const supabase = getSupabaseAdmin();
              
              // ARCHIVE LARGE CONTENT TO STORAGE (Save DB space)
              const archivedUserMsg = await StorageArchiver.archiveIfLarge(prompt, `chat/${sessionId}/user`);
              const archivedAiMsg = await StorageArchiver.archiveIfLarge(fullAiResponse, `chat/${sessionId}/ai`);

              const chatTitle = history.length === 0 
                ? prompt.substring(0, 40) + (prompt.length > 40 ? '...' : '')
                : null;

              // 2. Save individual messages to 'chat_history'
              // Every message in chat_history now potentially holds the title for that session
              await supabase.from('chat_history').insert([
                { user_id: userId, session_id: sessionId, role: 'user', content: archivedUserMsg, title: chatTitle },
                { user_id: userId, session_id: sessionId, role: 'assistant', content: archivedAiMsg }
              ]);
            } catch (dbError) {
              console.error('[Chat API] Failed to save to history:', dbError);
            }
          }
        } catch (error) {
          send({ type: 'error', error: String(error) });
        } finally {
          controller.close();
        }
      },
    });

    // Increment usage count before returning the stream
    try {
      await incrementUsage(userId);
    } catch (usageError) {
      console.error('[Chat API] Usage increment failed (non-fatal):', usageError);
    }

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[Chat API] Error:', error);
    return Response.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
