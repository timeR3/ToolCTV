import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // Allow requests to /login and public assets
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  // If there's no session, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If there is a session, allow the request
  return NextResponse.next();
}

export const config = {
  // Match all paths except for API routes, static files, and image optimization files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
