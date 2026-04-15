import { NextRequest, NextResponse } from 'next/server';

/** Extract the first email address from a Telegram message text */
function extractEmail(text: string): string | null {
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

/** Dark-themed HTML email template for admin replies */
function buildReplyEmail(replyText: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reply from Skripted Support</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111;border:1px solid #1f1f1f;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#00c896,#00a0ff);padding:32px 40px;">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Skripted Engine</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Support Team</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Reply from Support</p>
              <p style="margin:0 0 24px;color:#e0e0e0;font-size:16px;line-height:1.7;">Hi there,</p>
              <div style="background:#1a1a1a;border-left:3px solid #00c896;border-radius:4px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0;color:#e0e0e0;font-size:15px;line-height:1.8;white-space:pre-wrap;">${replyText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
              <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">
                This is a response to your recent support request on Skripted Engine.<br/>
                If you have further questions, feel free to send us another message.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #1f1f1f;text-align:center;">
              <p style="margin:0;color:#444;font-size:12px;">
                © ${new Date().getFullYear()} Skripted Engine. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Telegram update must have a message with reply_to_message
    const message = body?.message;
    if (!message?.reply_to_message) {
      // Not a reply — ignore silently
      return NextResponse.json({ ok: true });
    }

    const adminReplyText: string = message.text ?? '';
    const originalText: string = message.reply_to_message?.text ?? '';

    if (!adminReplyText || !originalText) {
      return NextResponse.json({ ok: true });
    }

    // Extract email from the ORIGINAL message (which contains "Email: user@example.com")
    const userEmail = extractEmail(originalText);
    if (!userEmail) {
      console.error('[Webhook] Could not extract email from original message:', originalText);
      return NextResponse.json({ ok: true });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('[Webhook] Missing RESEND_API_KEY');
      return NextResponse.json({ ok: false, error: 'Resend API key missing' }, { status: 500 });
    }

    // Use standard fetch to avoid 'resend' library dependency
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Skripted Support <support@resend.dev>',
        to: [userEmail],
        subject: 'Reply from Skripted Support Team',
        html: buildReplyEmail(adminReplyText),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Webhook] Resend error:', JSON.stringify(data));
      return NextResponse.json({ ok: false, error: data }, { status: 500 });
    }

    console.log(`[Webhook] Reply sent to ${userEmail}`);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Webhook] Unexpected error:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
