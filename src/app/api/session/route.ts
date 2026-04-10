import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, title, messages } = await request.json();

    const { error } = await supabase
      .from('messages')
      .upsert({
        id: sessionId,
        user_id: user.id,
        title: title || 'New Chat',
        content: messages,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('[Session API] Error saving session:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
