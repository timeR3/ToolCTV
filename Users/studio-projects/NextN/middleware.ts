
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth-session';
import { cookies } from 'next/headers';

// Define las rutas que no requieren autenticación
const publicRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const sessionCookie = cookies().get('session')?.value;
  const { pathname } = request.nextUrl;

  // Intenta obtener la sesión sin lanzar errores si no existe
  const session = sessionCookie ? await decrypt(sessionCookie).catch(() => null) : null;

  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Si el usuario intenta acceder a una ruta protegida sin una sesión válida, redirigir a login
  if (!isPublicRoute && (!session || !session.userId)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const response = NextResponse.redirect(url);
    // Limpia una cookie de sesión potencialmente inválida
    response.cookies.delete('session');
    return response;
  }

  // Si el usuario está logueado e intenta acceder a una ruta pública (como login), redirigir al dashboard
  if (session && session.userId && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Si todo es correcto, permite que la petición continúe
  return NextResponse.next();
}

export const config = {
  // El matcher evita que el middleware se ejecute en archivos estáticos y rutas de API
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs', // Esto es crucial para la compatibilidad con la base de datos
};
