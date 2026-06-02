import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Buscamos la pulsera VIP (la cookie que nos dio el backend)
  const token = request.cookies.get('next_auth_token')?.value;

  // 🔥 NUEVA REGLA: Rutas 100% Públicas (El patovica mira para otro lado)
  const isPublicRoute = request.nextUrl.pathname.startsWith('/consulta');
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 2. Identificamos qué rutas son exclusivas para loguearse/registrarse
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/registro') ||
                      request.nextUrl.pathname.startsWith('/recuperar')||
                      request.nextUrl.pathname.startsWith('/nueva-contrasena'); 

  // 3. REGLA A: Si NO tiene token y quiere entrar a la plataforma -> Lo pateamos al Login
  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. REGLA B: Si YA tiene token y quiere ir a la pantalla de Login -> Lo mandamos al Inicio (Dashboard)
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si pasa las validaciones, le abrimos la puerta
  return NextResponse.next();
}

// Configuración: Le decimos al patovica en qué puertas tiene que pararse
export const config = {
  matcher: [
    /*
     * Vigila todas las rutas de la app, EXCEPTO:
     * - api (rutas internas)
     * - _next/static (archivos de diseño de Next.js)
     * - _next/image (imágenes optimizadas)
     * - favicon.ico (el iconito de la pestaña)
     * - logo.png (nuestro logo estático)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)',
  ],
};