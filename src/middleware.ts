import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { swapClerkTokenForSupabase } from "@/lib/supabase-auth-swap";

const isSupabaseRoute = createRouteMatcher([
  "/api/session(.*)",
  "/api/feedback(.*)",
  "/api/chats(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, getToken } = await auth();

  // If the user is logged in and calling a Supabase-dependent API route
  if (userId && isSupabaseRoute(req)) {
    try {
      // Prioritize Clerk's official Supabase template integration
      const supabaseToken = await getToken({ template: 'supabase' });
      
      if (supabaseToken) {
        // Clone headers and inject the new Supabase-compatible JWT
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('Authorization', `Bearer ${supabaseToken}`);
        requestHeaders.set('x-auth-source', 'clerk-template');
        
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } else {
        console.warn('[Middleware] Supabase template token is empty. Falling back to manual swap.');
        const swappedToken = await swapClerkTokenForSupabase(userId);
        if (swappedToken) {
          const requestHeaders = new Headers(req.headers);
          requestHeaders.set('Authorization', `Bearer ${swappedToken}`);
          requestHeaders.set('x-auth-source', 'clerk-swap');
          return NextResponse.next({ request: { headers: requestHeaders } });
        }
      }
    } catch (error) {
      console.error('[Middleware] Token error:', error);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
