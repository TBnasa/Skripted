import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OPENROUTER_MODEL, OPENROUTER_BASE_URL } from '@/lib/constants';
import { fetchWithKeyRotation } from '@/lib/openrouter';
import { VerifyRequestSchema } from '@/types/schemas';

// export const runtime = 'edge';

/** Per-user rate limiting for verify: max 20 requests per minute */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
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

export async function POST(req: NextRequest) {
  try {
    // Auth guard — prevent unauthenticated LLM resource consumption
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

    const rawBody = await req.json();
    const result = VerifyRequestSchema.safeParse(rawBody);

    if (!result.success) {
      return Response.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }

    const { code } = result.data;

    const systemPrompt = `You are an AI Expert Reviewer for Minecraft Skript.
    Analyze the following Skript code for:
    1. Syntax errors and formatting mistakes.
    2. Performance leaks (e.g., laggy loops, heavy variable usage).
    3. Missing addon requirements (e.g., SkBee, SkRayFall).
    4. Logical errors.
    
    Reply strictly in JSON format:
    {
      "status": "Safe" | "Warning" | "Critical Error",
      "issues": [
        { "type": "Safe" | "Warning" | "Critical", "message": "Short description of the issue or praise." }
      ],
      "message": "A short, 1-2 sentence overall summary.",
      "addons": ["addon_name"]
    }
    DO NOT output anything other than the JSON object.`;

    const res = await fetchWithKeyRotation(OPENROUTER_BASE_URL, {
      method: 'POST',
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: code }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('[Verify API] OpenRouter error:', res.status, errorText);
      throw new Error(`Verification API failed: ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from verification service');
    }

    const parsedResult = JSON.parse(content);
    return Response.json(parsedResult);

  } catch (err) {
    console.error('[Verify API] error:', err);
    return Response.json(
      { valid: false, message: err instanceof Error ? err.message : 'Verification service error' },
      { status: 500 },
    );
  }
}
