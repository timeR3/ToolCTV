
export const runtime = 'nodejs';

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isAuthPage) {
    // If the user is logged in, redirect them from auth pages to the home page.
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // If not logged in and on an auth page, allow the request.
    return NextResponse.next();
  }
 
  // If there's no session cookie and the user is trying to access a protected page,
  // redirect them to the login page.
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
 
  // If the user has a session, allow them to proceed.
  return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
