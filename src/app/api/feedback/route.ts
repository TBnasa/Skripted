/* ═══════════════════════════════════════════
   Skripted — Feedback API Route
   Stores user feedback for RAG quality improvement
   ═══════════════════════════════════════════ */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '@/lib/constants';
import type { FeedbackPayload } from '@/types';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { userId, getToken } = await auth();
    
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

    // Check if middleware has already provided a swapped token
    const incomingAuth = request.headers.get('Authorization');
    const isSwapped = request.headers.get('x-auth-source') === 'clerk-swap';
    
    let supabaseToken: string | null = null;
    
    if (incomingAuth && isSwapped) {
      supabaseToken = incomingAuth.replace('Bearer ', '');
      console.log('[Feedback API] Using swapped Supabase token from middleware');
    } else {
      try {
        supabaseToken = await getToken({ template: 'supabase' });
      } catch (tokenError) {
        console.error('[Feedback API] Clerk getToken() failed:', tokenError);
      }
    }

    if (!supabaseToken) {
      console.error('[Feedback API] Supabase token is missing.');
      return NextResponse.json({ error: 'Auth token missing' }, { status: 401 });
    }

    const supabase = createClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${supabaseToken}`,
            apikey: NEXT_PUBLIC_SUPABASE_ANON_KEY
          }
        }
      }
    );

    const { error } = await supabase
      .from('feedback_logs')
      .insert({
        session_id: sessionId,
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
