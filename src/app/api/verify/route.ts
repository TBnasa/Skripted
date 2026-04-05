import { NextRequest } from 'next/server';
import { OPENROUTER_MODEL, OPENROUTER_BASE_URL } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return Response.json({ error: 'No code provided' }, { status: 400 });
    }

    const systemPrompt = `You are a Minecraft Skript expert. 
    Analyze the following Skript code for compatibility with Paper 1.21.1 and Skript parser 2.14.3.
    Reply strictly in JSON format:
    {
      "valid": true/false, // true if there are NO syntax errors and bad practices. false if there are syntax errors.
      "message": "A short, 1-2 sentence description of the errors found. If valid, say 'No errors found.'"
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
