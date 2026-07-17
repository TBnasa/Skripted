import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

/**
 * Proxy route for fetching user chats.
 * Uses service_role key server-side with manual user_id filtering.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Fetch sessions from chat_history by grouping session_ids
    // We get the max created_at and any non-null title
    const { data, error } = await supabase
      .from('chat_history')
      .select('session_id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Chats API] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Collapse into unique sessions using Map (O(n) instead of O(n²))
    const sessionMap = new Map<string, { id: string; title: string; created_at: string }>();
    for (const row of data) {
      const existing = sessionMap.get(row.session_id);
      if (!existing) {
        sessionMap.set(row.session_id, {
          id: row.session_id,
          title: row.title || 'Untitled Chat',
          created_at: row.created_at
        });
      } else if (row.title && existing.title === 'Untitled Chat') {
        existing.title = row.title;
      }
    }
    const sessions = Array.from(sessionMap.values());

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('[Chats API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
