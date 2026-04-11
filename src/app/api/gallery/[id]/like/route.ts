import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: postId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Beğenmek için giriş yapmalısınız' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: existingLike, error: selectError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;
      return NextResponse.json({ success: true, action: 'unliked' });
    } else {
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId });

      if (insertError) throw insertError;
      return NextResponse.json({ success: true, action: 'liked' });
    }
  } catch (err: any) {
    console.error('[Gallery Like POST] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu', details: err.message }, { status: 500 });
  }
}
