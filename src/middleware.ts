export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // If the user is trying to access an auth page
  if (isAuthPage) {
    // If they have a session, redirect them to the home page
    if (session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Otherwise, let them access the auth page
    return NextResponse.next();
  }

  // If the user is trying to access a protected page without a session
  if (!session) {
    // Redirect them to the login page
    const requestedPage = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(new URL(`/login${requestedPage}`, request.url));
  }
  
  // If they have a session and are accessing a protected page, allow it
  return NextResponse.next();
}

export const config = {
  // Match all paths except for API routes, static files, and image optimization files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
