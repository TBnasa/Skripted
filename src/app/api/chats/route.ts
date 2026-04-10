import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '@/lib/constants';

/**
 * Proxy route for fetching user chats.
 * Uses the token swap mechanism implemented in middleware.
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // The middleware will swap the Authorization header for us
    // So we just pass it through or re-initialize a client
    const incomingAuth = request.headers.get('Authorization');
    const isSwapped = request.headers.get('x-auth-source') === 'clerk-swap';
    
    let supabaseToken: string | null = null;
    if (incomingAuth && isSwapped) {
      supabaseToken = incomingAuth.replace('Bearer ', '');
    }

    if (!supabaseToken) {
      console.error('[Chats API] Token swap failed or token missing');
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
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

    const { data, error } = await supabase
      .from('chats')
      .select('id, title, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Chats API] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Chats API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
