import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserScriptService } from '@/services/server/user-script-service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await UserScriptService.getUserScripts(userId);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[UserScripts GET] Error:', err);
    return NextResponse.json({ error: 'Scriptler yüklenemedi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = await UserScriptService.createScript(userId, body);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[UserScripts POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Script kaydedilemedi' }, { status: 500 });
  }
}
