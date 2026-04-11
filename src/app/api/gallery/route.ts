import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { GalleryService } from '@/lib/services/gallery-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const filter = searchParams.get('filter');
    const category = searchParams.get('category') || undefined;
    const { userId } = await auth();

    const data = await GalleryService.getPosts({
      limit,
      filter: filter || undefined,
      category,
      userId
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Gallery GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = await request.json();
    const authorName = user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Anonymous';
    
    const data = await GalleryService.createPost(userId, authorName, rawBody);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Gallery POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
