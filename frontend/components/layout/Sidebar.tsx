"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Users, 
  FileText, 
  Bell, 
  LayoutDashboard, 
  Settings,
  LogOut // 1. Agregamos el icono de salida
} from 'lucide-react';

const menuItems = [
  { name: 'Inicio', icon: Home, path: '/' },
  { name: 'Asegurados', icon: Users, path: '/asegurados' },
  { name: 'Pólizas', icon: FileText, path: '/polizas' },
  { name: 'Alertas', icon: Bell, path: '/alertas' },
  { name: 'Panel de control', icon: LayoutDashboard, path: '/panel' },
  { name: 'Configuración', icon: Settings, path: '/configuracion' },
];

export default function Sidebar() {
  const router = useRouter();

  // 2. Función para cerrar sesión
  const handleLogout = async () => {
    try {
      // Le avisamos al backend que destruya la cookie segura
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Clave para que envíe y borre la cookie
      });
      
      // Lo mandamos al login, y como el middleware ya no ve la cookie, lo deja ahí
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <aside className="w-64 h-screen bg-green-700 text-white flex flex-col fixed left-0 top-0">
      {/* Zona del Logo */}
      <div className="h-24 flex items-center justify-center font-bold text-2xl tracking-wide">
        Logo
      </div>

      {/* Zona de Navegación */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Zona de Cerrar Sesión (Fijada abajo) */}
      <div className="p-4 border-t border-green-600/50 mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-green-800 transition-colors text-left"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}