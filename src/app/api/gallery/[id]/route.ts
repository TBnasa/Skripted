import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';
import { GalleryPostSchema } from '@/types/schemas';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('gallery_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Gönderi bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = GalleryPostSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Geçersiz veri formatı' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    
    // First check ownership
    const { data: post, error: checkError } = await supabase
      .from('gallery_posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkError || !post) {
      return NextResponse.json({ error: 'Gönderi bulunamadı' }, { status: 404 });
    }

    if (post.user_id !== userId) {
      return NextResponse.json({ error: 'Bu gönderiyi düzenleme yetkiniz yok' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('gallery_posts')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Gallery PUT] Error:', err);
    return NextResponse.json({ error: 'Gönderi güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();
    
    // Check ownership
    const { data: post, error: checkError } = await supabase
      .from('gallery_posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkError || !post) {
      return NextResponse.json({ error: 'Gönderi bulunamadı' }, { status: 404 });
    }

    if (post.user_id !== userId) {
      return NextResponse.json({ error: 'Bu gönderiyi silme yetkiniz yok' }, { status: 403 });
    }

    const { error } = await supabase
      .from('gallery_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Gallery DELETE] Error:', err);
    return NextResponse.json({ error: 'Gönderi silinemedi' }, { status: 500 });
  }
}
