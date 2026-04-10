import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, title, messages } = await request.json();

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Ownership check: prevent session hijacking by verifying the existing
    // chat belongs to the current user before allowing an upsert.
    const { data: existing } = await supabase
      .from('chats')
      .select('user_id')
      .eq('id', sessionId)
      .maybeSingle();

    if (existing && existing.user_id !== userId) {
      console.warn(`[Session API] User ${userId} attempted to overwrite chat ${sessionId} owned by ${existing.user_id}`);
      return NextResponse.json({ error: 'Forbidden: session belongs to another user' }, { status: 403 });
    }

    const { error } = await supabase
      .from('chats')
      .upsert({
        id: sessionId,
        user_id: userId,
        title: title || 'New Chat',
        content: messages,
      }, { onConflict: 'id' });

    if (error) {
      console.error('[Session API] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Session API] Request processing error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
