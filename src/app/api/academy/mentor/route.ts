import { NextRequest } from 'next/server';
import { fetchWithKeyRotation } from '@/lib/openrouter';
import { OPENROUTER_BASE_URL, OPENROUTER_MODEL } from '@/lib/constants';
import { buildMentorPrompt } from '@/lib/academy-mentor-prompt';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      lessonContext, 
      mistakes, 
      userLevel, 
      lang, 
      history, 
      editor_content, 
      system_status 
    } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build mentor system prompt with lesson context and real-time state
    const systemPrompt = buildMentorPrompt({
      lessonId: lessonContext?.lessonId || '',
      lessonTitle: lessonContext?.lessonTitle || '',
      lessonObjective: lessonContext?.lessonObjective || '',
      editor_content: editor_content || '',
      lastValidationResult: system_status || null,
      mistakes: mistakes || [],
      userLevel: userLevel || 1,
      phase: lessonContext?.phase || 'blocks',
      lang: lang || 'en',
    });

    // Build message array
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Stream from OpenRouter
    const response = await fetchWithKeyRotation(OPENROUTER_BASE_URL, {
      method: 'POST',
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        stream: true,
        temperature: 0.1,  // Lower temperature for strict adherence to persona and 3-sentence rule
        max_tokens: 512,   // Short responses as per rules
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[Academy Mentor] OpenRouter error:', errorBody);
      return new Response(JSON.stringify({ error: 'Mentor service unavailable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!response.body) {
      return new Response(JSON.stringify({ error: 'No response body' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Proxy the stream
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('[Academy Mentor] Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
