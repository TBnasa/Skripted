import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/chat(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const response = NextResponse.next();

  // Korunan rotalar için auth kontrolü
  if (isProtectedRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Hassas rotalar için cache kontrolü
  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/chat')) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
});

export const config = {
  matcher: [
    // Tüm rotaları dahil et (daha agresif matcher)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
