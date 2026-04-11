import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.rpc('increment_download_count', {
      post_id_to_increment: postId,
    });

    if (error) {
      console.error('[Gallery Download POST] RPC Error:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Gallery Download POST] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu', details: err.message }, { status: 500 });
  }
}
