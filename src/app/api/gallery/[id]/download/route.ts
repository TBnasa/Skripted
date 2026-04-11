import { NextRequest, NextResponse } from 'next/server';
import { GalleryService } from '@/lib/services/gallery-service';

export const runtime = 'nodejs';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const result = await GalleryService.incrementDownload(postId);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Gallery Download POST] Error:', err);
    return NextResponse.json({ error: 'İndirme sayısı artırılamadı' }, { status: 500 });
  }
}
