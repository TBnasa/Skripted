import { NextRequest, NextResponse } from 'next/server';
import { GalleryService } from '@/services/server/gallery.server';
import { auth, currentUser } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const data = await GalleryService.getComments(postId);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Gallery Comments GET] Error:', err);
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

    const { content } = await request.json();
    if (!content || content.length < 2) {
      return NextResponse.json({ error: 'Yorum en az 2 karakter olmalıdır' }, { status: 400 });
    }

    const authorName = user.fullName || user.username || 'Anonim';
    const data = await GalleryService.addComment(postId, userId, authorName, { content });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Gallery Comments POST] Error:', err);
    return NextResponse.json({ error: 'Yorum gönderilemedi' }, { status: 500 });
  }
}
