import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { z } from 'zod';

export const runtime = 'nodejs';

const commentSchema = z.object({
  content: z.string().min(2, "Yorum en az 2 karakter olmalıdır").max(500, "Yorum en fazla 500 karakter olmalıdır"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Gallery Comments GET] Exception:', err);
    return NextResponse.json({ error: 'Yorumlar yüklenemedi' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const { id: postId } = await params;

    if (!userId || !user) {
      return NextResponse.json({ error: 'Yorum yapmak için giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const validation = commentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const authorName = user.fullName || user.username || 'Anonim';

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        author_name: authorName,
        content: validation.data.content,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Gallery Comments POST] Exception:', err);
    return NextResponse.json({ error: 'Yorum gönderilemedi' }, { status: 500 });
  }
}
