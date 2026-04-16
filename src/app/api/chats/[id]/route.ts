import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { StorageArchiver } from '@/lib/storage-archiver';

/**
 * GET /api/chats/[id] — Load a single chat with its messages
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // FETCH GRANULAR HISTORY FROM chat_history (Max last 50)
    const { data: messages, error: msgError } = await supabase
      .from('chat_history')
      .select('id, role, content, title, created_at')
      .eq('session_id', id)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (msgError || !messages || messages.length === 0) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Resolve the title from the first message that has it
    const title = messages.find(m => m.title)?.title || 'Untitled Chat';

    // HYDRATE CONTENT FROM STORAGE (Restore large blobs)
    // We scan all messages and replace __BLOB__ REFs with actual content
    const hydratedMessages = await Promise.all(messages.map(async (m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: await StorageArchiver.resolveText(m.content),
      timestamp: new Date(m.created_at).getTime()
    })));

    return NextResponse.json({
      id,
      title,
      content: hydratedMessages,
      created_at: messages[0].created_at
    });
  } catch (error) {
    console.error('[Chat GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/chats/[id] — Rename a chat
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { title } = await request.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('chats')
      .update({ title: title.trim() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[Chat PATCH] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Chat PATCH] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/chats/[id] — Delete a chat
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[Chat DELETE] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Chat DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
