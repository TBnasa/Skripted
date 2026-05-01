import { NextResponse } from 'next/server';
import { currentUser, auth } from '@clerk/nextjs/server';
import { GalleryService } from '@/services/server/gallery.server';
import { withAuth, withPublic } from '@/lib/api-handler';

export const GET = withPublic(async (request) => {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const filter = searchParams.get('filter') || undefined;
  const category = searchParams.get('category') || undefined;
  
  // Optional auth for filtered "mine" view
  const { userId } = await auth();

  const data = await GalleryService.getPosts({
    limit,
    filter,
    category,
    userId
  });

  return NextResponse.json(data);
});

export const POST = withAuth(async (request, { userId }) => {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'User data not found' }, { status: 404 });

  const rawBody = await request.json();
  const authorName = user.username || user.firstName || 'Anonymous';
  
  const data = await GalleryService.createPost(userId, authorName, rawBody);
  return NextResponse.json(data);
});
