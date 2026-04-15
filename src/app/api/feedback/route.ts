import { NextRequest, NextResponse } from 'next/server';

/**
 * Escapes special HTML characters to prevent Telegram parse errors (HTML mode).
 * This is the ONLY safe way to use parse_mode: HTML with user-supplied content.
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, message } = body;

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required.' },
        { status: 400 }
      );
    }

    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_ADMIN_ID?.trim();

    if (!token || !chatId) {
      console.error('[Feedback API] TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_ID is missing.');
      return NextResponse.json(
        { error: 'Server configuration error: missing Telegram credentials.' },
        { status: 500 }
      );
    }

    // Escape user content — critical for HTML mode
    const safeEmail = escapeHtml(email.trim());
    const safeMessage = escapeHtml(message.trim());

    // Simple, flat HTML template — avoids any nesting issues
    const text = `<b>📩 New Support Message</b>\n\n📧 Email: ${safeEmail}\n💬 Message: ${safeMessage}`;

    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: Number(chatId),
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('FULL TELEGRAM ERROR:', JSON.stringify(errorData));
      return NextResponse.json(
        { error: 'Telegram delivery failed.', telegram: errorData },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Feedback API] Unexpected error:', message);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
