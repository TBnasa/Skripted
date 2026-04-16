import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserScriptService } from '@/services/server/user-script-service';

export const runtime = 'nodejs';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await UserScriptService.deleteScript(id, userId);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[UserScripts DELETE] Error:', err);
    return NextResponse.json({ error: err.message || 'Script silinemedi' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = await UserScriptService.updateScript(id, userId, body);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[UserScripts PATCH] Error:', err);
    return NextResponse.json({ error: err.message || 'Script güncellenemedi' }, { status: 500 });
  }
}
