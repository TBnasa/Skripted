import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { ProfileService } from '@/services/server/profile-service';
import { withAuth } from '@/lib/api-handler';
import { ProfileUpdateSchema } from '@/types/schemas';

export const GET = withAuth(async (_req, { userId }) => {
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
});

export const PATCH = withAuth(async (request, { userId }) => {
  const body = await request.json();
  
  // Strict Validation (Security: Mass Assignment Mitigation)
  const validatedData = ProfileUpdateSchema.parse(body);
  
  const updated = await ProfileService.upsertProfile(userId, validatedData);
  return NextResponse.json(updated);
});
