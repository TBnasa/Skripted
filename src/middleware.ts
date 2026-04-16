import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { createClient } from '@/utils/supabase/middleware';
import { type NextRequest } from 'next/server';

// Public rotaları belirleyelim (Giriş yapmadan erişilebilecek yerler)
const isPublicRoute = createRouteMatcher([
  '/',
  '/api/chat(.*)', // Chat API'si Clerk ile korunuyorsa burayı kaldırabiliriz
  '/api/feedback(.*)',
  '/pricing(.*)',
  '/support(.*)',
  '/(.*)' // Şu an için hepsine izin verelim, Supabase kendi güvenliğini sağlar
]);

export default clerkMiddleware(async (auth, request) => {
  // 1. Supabase Client oluştur (Auth token yenileme vb. işlemler için)
  const response = await createClient(request);

  // 2. Eğer public bir rota değilse Clerk koruması uygula
  // if (!isPublicRoute(request)) {
  //   await auth.protect();
  // }

  return response;
});

export const config = {
  matcher: [
    // Next.js dahili dosyalarını ve statik dosyaları atla
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API rotaları için her zaman çalıştır
    '/(api|trpc)(.*)',
  ],
};
