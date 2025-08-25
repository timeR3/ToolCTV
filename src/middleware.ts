import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;
  const isPublicPath = pathname.startsWith('/login') || pathname.startsWith('/register');

  // If the user has a session and is trying to access a public path (login/register),
  // redirect them to the dashboard.
  if (session && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If the user does not have a session and is trying to access a protected path,
  // redirect them to the login page.
  if (!session && !isPublicPath) {
    // Allow access to Next.js specific paths even without a session
    if (pathname.startsWith('/_next') || pathname.startsWith('/static')) {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  // Match all paths except for API routes, static files, and image optimization files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
