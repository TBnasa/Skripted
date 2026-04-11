import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ProfileService } from '@/lib/services/profile-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { followingId, action } = await request.json();

    if (action === 'follow') {
      await ProfileService.followUser(userId, followingId);
    } else {
      await ProfileService.unfollowUser(userId, followingId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
