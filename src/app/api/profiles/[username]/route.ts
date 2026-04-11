import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/lib/services/profile-service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const profile = await ProfileService.getProfile(username);
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
