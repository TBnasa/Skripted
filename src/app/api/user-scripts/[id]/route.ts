import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

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
    
    // Check ownership
    const { data: script, error: checkError } = await supabase
      .from('user_scripts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkError || !script) {
      return NextResponse.json({ error: 'Script bulunamadı' }, { status: 404 });
    }

    if (script.user_id !== userId) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
    }

    const { error } = await supabase
      .from('user_scripts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[UserScripts DELETE] Error:', err);
    return NextResponse.json({ error: 'Script silinemedi' }, { status: 500 });
  }
}
