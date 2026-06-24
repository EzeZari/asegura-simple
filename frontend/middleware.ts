// v3 - fix rutas legales publicas
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('next_auth_token')?.value;

  // 🔥 ACÁ AGREGAMOS LAS NUEVAS RUTAS PÚBLICAS
  const isPublicRoute = 
    request.nextUrl.pathname.startsWith('/consulta') || 
    request.nextUrl.pathname.startsWith('/planes') ||
    request.nextUrl.pathname.startsWith('/terminos') ||
    request.nextUrl.pathname.startsWith('/privacidad');
                        
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isAuthRoute = 
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/registro') ||
    request.nextUrl.pathname.startsWith('/recuperar') ||
    request.nextUrl.pathname.startsWith('/nueva-contrasena'); 

  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)',],
};