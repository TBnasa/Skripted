import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { streamGoogleCompletion } from '@/lib/google-ai';
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

    const upstreamStream = await streamGoogleCompletion(messages);
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformedStream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        let fullAiResponse = '';
        try {
          send({ type: 'meta', pineconeIds });
          const reader = upstreamStream.getReader();

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              send({ type: 'done' });
              break;
            }

            const chunkText = decoder.decode(value);
            fullAiResponse += chunkText;
            send({ type: 'content', content: chunkText });
          }

          // Persistence Logic
          if (sessionId) {
            try {
              const supabase = getSupabaseAdmin();
              const archivedUserMsg = await StorageArchiver.archiveIfLarge(prompt, `chat/${sessionId}/user`);
              const archivedAiMsg = await StorageArchiver.archiveIfLarge(fullAiResponse, `chat/${sessionId}/ai`);

              const chatTitle = history.length === 0 
                ? prompt.substring(0, 40) + (prompt.length > 40 ? '...' : '')
                : null;

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
    return Response.json({ 
      error: 'Generation failed. Please try again.', 
      details: error.message,
      code: error.status === 402 ? 'INSUFFICIENT_CREDITS' : 'SERVER_ERROR'
    }, { status: error.status || 500 });
  }
}
