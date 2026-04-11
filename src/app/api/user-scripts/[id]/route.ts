import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    
    // Check ownership
    const { data: script, error: checkError } = await supabase
      .from('user_scripts')
      .select('user_id')
      .eq('id', params.id)
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
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[UserScripts DELETE] Error:', err);
    return NextResponse.json({ error: 'Script silinemedi' }, { status: 500 });
  }
}
