import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUsageLimit } from '@/lib/utils/usage-limit';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usage = await checkUsageLimit(userId);

    return Response.json(usage);
  } catch (error: any) {
    console.error('[Usage API] Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
