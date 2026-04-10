import { NextResponse } from 'next/server';

/**
 * Legacy OAuth callback route.
 * Authentication is now handled by Clerk.
 * This route simply redirects to the chat page.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/chat`);
}
