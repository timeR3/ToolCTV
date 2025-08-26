'use server';

import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './src/lib/auth-session';
import { cookies } from 'next/headers';

// All routes are protected by default, except for the public routes.
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
  const sessionCookie = cookies().get('session')?.value;
  const session = sessionCookie ? await decrypt(sessionCookie) : null;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname === '/' || (route !== '/' && pathname.startsWith(route)));
  
  // If the user is trying to access a protected route without a valid session, redirect to login.
  if (isProtectedRoute && (!session || !session.userId)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const response = NextResponse.redirect(url);
    // Clean up potentially invalid session cookie
    response.cookies.delete('session');
    return response;
  }

  // If the user is logged in and tries to access a public route (like login), redirect to the dashboard.
  if (session && session.userId && publicRoutes.includes(pathname)) {
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
