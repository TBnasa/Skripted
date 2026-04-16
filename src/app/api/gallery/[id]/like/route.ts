import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GalleryService } from '@/services/server/gallery.server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

export const runtime = 'nodejs';

const LIKE_RATE_LIMIT = { windowMs: 60_000, max: 10 }; // 10 likes per minute

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

    // Rate limiting
    const { success } = checkRateLimit(`like:${userId}`, LIKE_RATE_LIMIT);
    if (!success) {
      return NextResponse.json({ error: 'Çok fazla beğeni yaptınız. Lütfen bekleyin.' }, { status: 429 });
    }

    const data = await GalleryService.toggleLike(postId, userId);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Gallery Like POST] Error:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
