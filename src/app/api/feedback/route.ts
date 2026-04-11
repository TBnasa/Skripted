/* ═══════════════════════════════════════════
   Skripted — Feedback API Route
   Stores user feedback for RAG quality improvement
   ═══════════════════════════════════════════ */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import type { FeedbackPayload } from '@/types';
import { FeedbackPayloadSchema } from '@/types/schemas';
import { JudgeService } from '@/lib/services/judge-service';
import { StorageArchiver } from '@/lib/storage-archiver';

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
    
    // OFFLOAD CODE TO STORAGE (Save DB space)
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
      return Response.json({ stored: false, reason: 'storage_error' });
    }

    // AI JUDGE INTEGRATION
    // We run this in the background to avoid blocking the user response, 
    // though in a serverless environment like Vercel, we must be careful.
    // For now, we update it synchronously to ensure the judge runs.
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
        
      console.log(`[Judge] Feedback ${insertedData.id} verified with score: ${verdict.trustScore}`);
    } catch (judgeError) {
      console.error('[Feedback API] Judge failed:', judgeError);
    }

    return Response.json({ stored: true, success, verified: true });
  } catch (error) {
    console.error('[Feedback API] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
