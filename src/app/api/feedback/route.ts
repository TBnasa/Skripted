/* ═══════════════════════════════════════════
   Skripted — Feedback API Route
   Stores user feedback for RAG quality improvement
   ═══════════════════════════════════════════ */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import type { FeedbackPayload } from '@/types';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: FeedbackPayload = await request.json();
    const {
      sessionId,
      prompt,
      generatedCode,
      success,
      errorLog,
      consoleOutput,
      pineconeIds,
    } = body;

    if (!sessionId || !prompt || !generatedCode || typeof success !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, prompt, generatedCode, success' },
        { status: 400 },
      );
    }

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
