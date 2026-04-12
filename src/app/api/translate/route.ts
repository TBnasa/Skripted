import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 });
    }

    const systemPrompt = `You are a professional translator for a Minecraft Skript IDE platform.
    Your task is to translate the provided text between Turkish and English.
    
    CRITICAL INSTRUCTIONS:
    1. If the input text is in Turkish, translate it into English.
    2. If the input text is in English, translate it into Turkish.
    3. If the input text is in a different language, translate it into ${targetLang === 'tr' ? 'Turkish' : 'English'}.
    4. Maintain technical Minecraft Skript terminology (like 'loop', 'variables', 'addons', 'trigger', 'event') accurately in context.
    5. Maintain the original tone and formatting (emojis, line breaks).
    6. Respond ONLY with the translated text, do not include any prefixes, explanations, or notes.
    7. If the text cannot be translated, return it exactly as is.
    
    Target UI Language Reference: ${targetLang}`;

    const translation = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ]);

    const result = translation.trim();
    
    // Safety check: if AI returns the same text or empty, handle it
    if (!result || result === text.trim()) {
      // Try one more time with a simpler prompt if the first one failed to produce a change
      const simplePrompt = `Translate the following text to ${targetLang === 'tr' ? 'Turkish' : 'English'}. If already in that language, translate to the other (Turkish <-> English). Return ONLY translation.`;
      const fallback = await chatCompletion([
        { role: 'system', content: simplePrompt },
        { role: 'user', content: text }
      ]);
      return NextResponse.json({ translation: fallback.trim() });
    }

    return NextResponse.json({ translation: result });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
