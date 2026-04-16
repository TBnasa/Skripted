import { NextRequest, NextResponse } from 'next/server';
import { GalleryService } from '@/services/server/gallery.server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await GalleryService.getPostById(id);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Gallery GET ID] Error:', err);
    return NextResponse.json({ error: 'Gönderi bulunamadı' }, { status: 404 });
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
    const data = await GalleryService.updatePost(id, userId, body);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Gallery PUT] Error:', err);
    return NextResponse.json({ error: err.message || 'Gönderi güncellenemedi' }, { status: 500 });
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
    const result = await GalleryService.deletePost(id, userId);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Gallery DELETE] Error:', err);
    return NextResponse.json({ error: err.message || 'Gönderi silinemedi' }, { status: 500 });
  }
}
