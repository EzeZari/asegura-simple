// v5 - fix landing page publica + redireccion de usuarios
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Extraemos el pathname limpio para usarlo en todo el archivo
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('next_auth_token')?.value;

  // 🔥 1. INMUNIDAD PARA EL BACKOFFICE ADMIN
  // Lo ponemos arriba de todo para que ni siquiera evalúe si tiene token normal
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // 🔥 2. RUTAS PÚBLICAS
  const isPublicRoute = 
    pathname === '/' || // <-- ACÁ PERMITIMOS LA LANDING PAGE
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

  // Si YA tiene token y está intentando entrar al login/registro -> Lo mandamos al dashboard
  if (token && isAuthRoute) {
    // 🔥 ACÁ LO MANDAMOS AL DASHBOARD (Ajustá '/inicio' si tu ruta principal es otra, como '/estadisticas')
    return NextResponse.redirect(new URL('/inicio', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)'],
};