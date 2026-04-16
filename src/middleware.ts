import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { createClient } from '@/utils/supabase/middleware';
import { type NextRequest } from 'next/server';

// Public rotalar (Auth gerektirmeyenler)
const isPublicRoute = createRouteMatcher([
  '/',
  '/api/chat(.*)',
  '/api/feedback(.*)',
  '/pricing(.*)',
  '/support(.*)',
  '/gallery(.*)',
  '/academy(.*)'
]);

export default clerkMiddleware((auth, request) => {
  // Supabase çerezlerini güncelle (Auth yenileme için gerekli)
  // Not: createClient asenkron değil, await kaldırıldı.
  const supabaseResponse = createClient(request);

  // Korunması gereken rotalar için (şu an kapalı tutuyoruz)
  // if (!isPublicRoute(request)) auth().protect();

  return supabaseResponse;
});

export const config = {
  matcher: [
    // Next.js dahili dosyaları ve statik dosyalar hariç her şeyi tara
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Her zaman API rotaları için çalıştır
    '/(api|trpc)(.*)',
  ],
};
