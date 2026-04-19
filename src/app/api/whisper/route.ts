import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * ⚡ WHISPER VOICE-TO-TEXT & API ROTATION PROTOKOLÜ
 * Model: whisper-large-v3-turbo
 * Logic: Rotates through 4 Groq API keys if one fails or rate limits.
 */

const GROQ_KEYS = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
].filter((key): key is string => !!key);

async function tryTranscription(formData: FormData, keyIndex: number): Promise<Response> {
  if (keyIndex >= GROQ_KEYS.length) {
    throw new Error('All API keys failed or exhausted.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_KEYS[keyIndex]}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`[Whisper API] Key ${keyIndex + 1} failed:`, errorData);
    
    // If rate limited or server error, try next key
    if (response.status === 429 || response.status >= 500) {
      return tryTranscription(formData, keyIndex + 1);
    }
    
    throw new Error(errorData.error?.message || `Transcription failed with status ${response.status}`);
  }

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Re-construct form data for Groq API
    const groqFormData = new FormData();
    groqFormData.append('file', file);
    groqFormData.append('model', 'whisper-large-v3-turbo');
    groqFormData.append('temperature', '0');
    groqFormData.append('response_format', 'verbose_json');

    const transcriptionResponse = await tryTranscription(groqFormData, 0);
    const result = await transcriptionResponse.json();

    return NextResponse.json({ text: result.text });
  } catch (err: any) {
    console.error('[Whisper Route] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
