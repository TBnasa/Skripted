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

    const supabase = getSupabaseAdmin();

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
