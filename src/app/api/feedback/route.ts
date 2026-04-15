import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { FeedbackPayloadSchema } from '@/types/schemas';
import { JudgeService } from '@/lib/services/judge-service';
import { StorageArchiver } from '@/lib/storage-archiver';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const rawBody = await request.json();
    const result = FeedbackPayloadSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: result.error.format() },
        { status: 400 },
      );
    }

    // HANDLE SUPPORT FEEDBACK (Telegram Bridge)
    if ('email' in result.data && 'message' in result.data) {
      const { email, message } = result.data;
      
      const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
      const chatId = process.env.TELEGRAM_ADMIN_ID?.trim();

      if (!token || !chatId) {
        console.error('[Feedback API] Missing Telegram configuration');
        return NextResponse.json({ error: 'Support bridge not configured' }, { status: 500 });
      }

      // ROBUST FORMATTING: Simple HTML template to avoid parsing errors
      const telegramText = `<b>New Message</b>\nEmail: ${email}\nMessage: ${message}`;

      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: Number(chatId),
            text: telegramText,
            parse_mode: 'HTML',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          // DEBUG LOGGING: Vital for diagnosing 400 errors
          console.error("FULL TELEGRAM ERROR:", JSON.stringify(errorData));
          return NextResponse.json(
            { error: 'Telegram API failure', details: errorData.description },
            { status: response.status }
          );
        }

        return NextResponse.json({ success: true, type: 'support' });
      } catch (tgError: any) {
        console.error('[Feedback API] Telegram Fetch Error:', tgError.message);
        return NextResponse.json({ error: 'Failed to connect to Telegram' }, { status: 502 });
      }
    }

    // HANDLE CODE FEEDBACK (Supabase)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      sessionId,
      prompt,
      generatedCode,
      success,
      errorLog,
      consoleOutput,
      pineconeIds,
    } = result.data as any;

    const supabase = getSupabaseAdmin();
    const archivedCode = await StorageArchiver.archiveIfLarge(generatedCode, 'feedback');

    const { data: insertedData, error } = await supabase
      .from('feedback_logs')
      .insert({
        session_id: sessionId,
        user_id: userId,
        prompt,
        generated_code: archivedCode,
        success,
        error_log: errorLog ?? null,
        console_output: consoleOutput ?? null,
        pinecone_ids: pineconeIds ?? [],
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Feedback API] Supabase error:', error);
      return NextResponse.json({ stored: false, reason: 'storage_error' }, { status: 500 });
    }

    try {
      const verdict = await JudgeService.analyzeFeedback(prompt, generatedCode, success, errorLog);
      await supabase
        .from('feedback_logs')
        .update({
          ai_trust_score: verdict.trustScore,
          ai_analysis: verdict.analysis,
          is_verified: verdict.isVerified
        })
        .eq('id', insertedData.id);
    } catch (judgeError) {
      console.error('[Feedback API] Judge failed:', judgeError);
    }

    return NextResponse.json({ stored: true, success, verified: true });
  } catch (error: any) {
    console.error('[Feedback API] Global Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
