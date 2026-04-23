import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ['en', 'tr'];
const defaultLocale = 'en';

function getLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage?.includes('tr')) return 'tr';
  return defaultLocale;
}

const isPublicRoute = createRouteMatcher([
  '/:lang/login(.*)',
  '/:lang/pricing(.*)',
  '/:lang/gallery(.*)',
  '/:lang/academy(.*)',
  '/:lang/support(.*)',
  '/:lang/u/(.*)',
  '/api/(.*)',
  '/auth/(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // 1. Locale Kontrolü ve Yönlendirme
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // 2. Clerk Koruması
  if (!isPublicRoute(request)) {
    (await auth()).protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Next.js dahili dosyaları ve tüm statik dosyaları atla
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API ve TRPC rotaları için her zaman çalıştır
    '/(api|trpc)(.*)',
  ],
};
