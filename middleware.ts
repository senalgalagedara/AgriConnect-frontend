import { NextResponse, NextRequest } from 'next/server';

// Adjust this list with routes you want SSR-level protection
const PROTECTED_PREFIXES = [
  '/checkout',
  '/cart',
  '/dashboard',
  '/orders',
  '/payments',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) {
    // Heuristic: look for a session cookie (customize the names to match backend)
    const sessionCookie = req.cookies.get('sid') || req.cookies.get('sessionid') || req.cookies.get('auth');
    if (!sessionCookie) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)'],
};
