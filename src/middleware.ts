import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk Middleware — En stabil ve hafif yapı
export default clerkMiddleware();

export const config = {
  matcher: [
    // Next.js dahili dosyaları ve tüm statik dosyaları atla
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API ve TRPC rotaları için her zaman çalıştır
    '/(api|trpc)(.*)',
  ],
};
