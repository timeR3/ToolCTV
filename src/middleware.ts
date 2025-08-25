export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on the edge and is designed to be fast.
// It only checks for the presence of a session cookie.
// Full session validation happens in the page/layout components.

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // If the user is trying to access an auth page
  if (isAuthPage) {
    // If they have a session cookie, redirect them to the home page
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Otherwise, let them access the auth page
    return NextResponse.next();
  }

  // If the user is trying to access a protected page without a session cookie
  if (!sessionCookie) {
    // Redirect them to the login page, preserving the originally requested URL
    const requestedPage = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(new URL(`/login${requestedPage}`, request.url));
  }
  
  // If they have a session cookie and are accessing a protected page, allow it
  return NextResponse.next();
}

export const config = {
  // Match all paths except for API routes, static files, and image optimization files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
