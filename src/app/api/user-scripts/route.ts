import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { UserScriptSchema } from '@/types/schemas';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('user_scripts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[UserScripts GET] Exception:', err);
    return NextResponse.json({ error: 'Scriptler yüklenemedi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = UserScriptSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { title, content, version } = validation.data;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('user_scripts')
      .insert({
        user_id: userId,
        title,
        content,
        version: version || '1.0.0',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[UserScripts POST] Exception:', err);
    return NextResponse.json({ error: 'Script kaydedilemedi' }, { status: 500 });
  }
}
