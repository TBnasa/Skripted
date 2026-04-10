/* ═══════════════════════════════════════════
   Skripted — Feedback API Route
   Stores user feedback for RAG quality improvement
   ═══════════════════════════════════════════ */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import type { FeedbackPayload } from '@/types';
import { FeedbackPayloadSchema } from '@/types/schemas';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = await request.json();
    const result = FeedbackPayloadSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: result.error.format() },
        { status: 400 },
      );
    }
    
    const {
      sessionId,
      prompt,
      generatedCode,
      success,
      errorLog,
      consoleOutput,
      pineconeIds,
    } = result.data;

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('feedback_logs')
      .insert({
        session_id: sessionId,
        user_id: userId,
        prompt,
        generated_code: generatedCode,
        success,
        error_log: errorLog ?? null,
        console_output: consoleOutput ?? null,
        pinecone_ids: pineconeIds ?? [],
      });

    if (error) {
      console.error('[Feedback API] Supabase error:', error);
      // Don't fail the request if feedback storage fails
      // — the user experience should not depend on telemetry
      return Response.json({ stored: false, reason: 'storage_error' });
    }

    return Response.json({ stored: true, success });
  } catch (error) {
    console.error('[Feedback API] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
