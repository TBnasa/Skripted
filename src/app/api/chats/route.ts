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

    // Collapse into unique sessions for the Sidebar
    const sessions = data.reduce((acc: any[], current) => {
      const existing = acc.find(s => s.id === current.session_id);
      if (!existing) {
        acc.push({
          id: current.session_id,
          title: current.title || 'Untitled Chat',
          created_at: current.created_at
        });
      } else if (current.title && !existing.title) {
        existing.title = current.title;
      }
      return acc;
    }, []);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('[Chats API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
