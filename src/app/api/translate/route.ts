import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 });
    }

    const systemPrompt = `You are a professional translator. Translate the following text to ${targetLang === 'tr' ? 'Turkish' : 'English'}. 
    Maintain the original tone and context, especially technical Minecraft or Skript terms. 
    Only return the translated text, nothing else.`;

    const translation = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ]);

    return NextResponse.json({ translation: translation.trim() });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
