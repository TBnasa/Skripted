import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ProfileService } from '@/services/server/profile-service';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await ProfileService.getProfileById(userId);
    
    // If profile doesn't exist, create a basic one from Clerk data
    if (!profile) {
      const user = await currentUser();
      if (user) {
        const username = user.username || `user_${userId.slice(-5)}`;
        const newProfile = await ProfileService.upsertProfile(userId, {
          username,
          full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          avatar_url: user.imageUrl,
        });
        return NextResponse.json(newProfile);
      }
    }

    return NextResponse.json(profile);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const updated = await ProfileService.upsertProfile(userId, body);
    
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
