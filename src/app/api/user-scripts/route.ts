import { NextResponse } from 'next/server';
import { UserScriptService } from '@/services/server/user-script-service';
import { withAuth } from '@/lib/api-handler';

export const runtime = 'nodejs';

export const GET = withAuth(async (_request, { userId }) => {
  const data = await UserScriptService.getUserScripts(userId);
  return NextResponse.json(data);
});

export const POST = withAuth(async (request, { userId }) => {
  const body = await request.json();
  const data = await UserScriptService.createScript(userId, body);
  return NextResponse.json(data);
});
