
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth-session';
import { cookies } from 'next/headers';

// All routes are protected by default, except for the public routes.
const protectedRoutes = [
    '/',
    '/profile',
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

  console.log(`Middleware - Pathname: ${pathname}`);
  console.log(`Middleware - Session Cookie Found: ${!!sessionCookie}`);
  if (sessionCookie) {
    console.log(`Middleware - Session Cookie Value (first 20 chars): ${sessionCookie.substring(0, 20)}...`);
  }
  console.log(`Middleware - Session Decrypted (userId): ${session?.userId || 'None'}`);
  console.log(`Middleware - Is Protected Route: ${protectedRoutes.some(route => pathname === '/' || (route !== '/' && pathname.startsWith(route)))}`);

  const isProtectedRoute = protectedRoutes.some(route => pathname === '/' || (route !== '/' && pathname.startsWith(route)));
  
  // If the user is trying to access a protected route without a valid session, redirect to login.
  if (isProtectedRoute && (!session || !session.userId)) {
    console.log('Middleware - Redirecting to login: Protected route without valid session.');
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const response = NextResponse.redirect(url);
    // Clean up potentially invalid session cookie
    response.cookies.delete('session');
    return response;
  }

  // If the user is logged in and tries to access a public route (like login), redirect to the dashboard.
  if (session && session.userId && publicRoutes.includes(pathname)) {
    console.log('Middleware - Redirecting to dashboard: Logged in user accessing public route.');
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
