// v5 - fix landing page publica + redireccion de usuarios
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Extraemos el pathname limpio para usarlo en todo el archivo
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('next_auth_token')?.value;

  // 🔥 1. INMUNIDAD PARA EL BACKOFFICE ADMIN
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // 🔥 2. RUTAS PÚBLICAS
  const isPublicRoute = 
    pathname === '/' || 
    pathname.startsWith('/contacto') ||
    pathname.startsWith('/consulta') || 
    pathname.startsWith('/planes') ||
    pathname.startsWith('/terminos') ||
    pathname.startsWith('/privacidad');
                        
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 🔥 3. RUTAS DE AUTENTICACIÓN
  const isAuthRoute = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/registro') ||
    pathname.startsWith('/recuperar') ||
    pathname.startsWith('/nueva-contrasena'); 

  // Si no tiene token y NO está en una ruta de auth -> Lo mandamos al login normal
  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si YA tiene token y está intentando entrar al login/registro -> Lo mandamos a donde pidió o al dashboard
  if (token && isAuthRoute) {
    // 🔥 Leemos si la URL traía una redirección pendiente
    const redirectPath = request.nextUrl.searchParams.get('redirect');
    
    if (redirectPath) {
      // Si venía del correo, lo mandamos directo al plan
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    
    // Si entró al login de forma normal, lo mandamos a inicio
    return NextResponse.redirect(new URL('/inicio', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)'],
};