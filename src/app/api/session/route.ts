import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '@/lib/constants';

export async function POST(request: NextRequest) {
  let clerkAuth;
  try {
    clerkAuth = await auth();
  } catch (authError) {
    console.error('[Session API] Clerk auth() failed:', authError);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }

  const { userId, getToken } = clerkAuth;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sessionId, title, messages } = await request.json();
    
    let token;
    try {
      token = await getToken({ template: 'supabase' });
    } catch (tokenError) {
      console.error('[Session API] Clerk getToken() failed:', tokenError);
      return NextResponse.json({ error: 'Failed to retrieve auth token' }, { status: 500 });
    }

    if (!token) {
      console.error('[Session API] Supabase token is missing. Ensure the "supabase" template is configured in Clerk.');
      return NextResponse.json({ error: 'Auth token missing' }, { status: 401 });
    }

    const supabase = createClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: NEXT_PUBLIC_SUPABASE_ANON_KEY
          }
        }
      }
    );

    const { error } = await supabase
      .from('chats')
      .upsert({
        id: sessionId,
        user_id: userId,
        title: title || 'New Chat',
        content: messages,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('[Session API] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Session API] Request processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
