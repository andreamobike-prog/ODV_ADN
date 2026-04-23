import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_AUTHENTICATED_PATH, resolvePostLoginRedirect } from '@/lib/auth/redirect';
import { updateSession } from '@/lib/supabase/middleware';

const protectedPrefixes = [
  '/',
  '/dashboard',
  '/soci',
  '/volontari',
  '/eventi',
  '/gruppi',
  '/tessera',
  '/tessere',
  '/impostazioni',
  '/assistenza',
  '/assistenza-tecnica',
  '/tutorial',
  '/accessi',
  '/utenti-e-livelli',
];

function isProtectedRoute(pathname: string) {
  if (pathname === '/') {
    return true;
  }

  return protectedPrefixes
    .filter((prefix) => prefix !== '/')
    .some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAuthRoute(pathname: string) {
  return pathname === '/login' || pathname === '/forgot-password' || pathname === '/update-password';
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { response, user } = await updateSession(request);

  if (isAuthRoute(pathname) && user) {
    const url = request.nextUrl.clone();
    url.href = new URL(
      resolvePostLoginRedirect(
        request.nextUrl.searchParams.get('next') ?? DEFAULT_AUTHENTICATED_PATH
      ),
      request.url
    ).toString();

    return NextResponse.redirect(url);
  }

  if (isProtectedRoute(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set(
      'next',
      pathname === '/'
        ? DEFAULT_AUTHENTICATED_PATH
        : `${pathname}${request.nextUrl.search}`
    );

    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
