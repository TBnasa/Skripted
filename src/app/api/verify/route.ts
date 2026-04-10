import { NextRequest } from 'next/server';
import { OPENROUTER_MODEL, OPENROUTER_BASE_URL } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return Response.json({ error: 'No code provided' }, { status: 400 });
    }

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

    const res = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
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
      throw new Error('Verification API failed');
    }

    const data = await res.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    return Response.json(result);

  } catch (err) {
    console.error('[Verify API] error:', err);
    return Response.json({ valid: false, message: 'Verification service error' }, { status: 500 });
  }
}
