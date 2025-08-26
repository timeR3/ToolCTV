'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './src/lib/auth-session';

const protectedRoutes = [
    '/',
    '/profile',
    '/tool',
    '/manage-users',
    '/manage-tools',
    '/manage-categories',
    '/manage-permissions',
    '/audit-log'
];
const publicRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!session && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (session && publicRoutes.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Matcher avoids middleware from running on static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs', // This is crucial for database compatibility
};
