"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // <-- Sumamos usePathname
import { 
  Home, Users, FileText, Building, CarFront, Bell, Settings, LogOut, BarChart3 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
  { name: 'Inicio', icon: Home, path: '/' },
  { name: 'Asegurados', icon: Users, path: '/asegurados' },
  { name: 'Pólizas', icon: FileText, path: '/polizas' },
  { name: 'Siniestros', icon: CarFront, path: '/siniestros' }, // <-- Nuestro nuevo módulo
  { name: 'Compañías', icon: Building, path: '/companias' }, 
  { name: 'Alertas', icon: Bell, path: '/alertas' },
  { name: 'Estadísticas', icon: BarChart3, path: '/estadisticas' },
  { name: 'Configuración', icon: Settings, path: '/configuracion' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname(); // <-- Nos dice en qué ruta estamos parados
  
  const user = useAuthStore((state) => state.user);
  const clearStore = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', 
      });
      
      clearStore();
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <aside className="w-64 h-screen bg-green-700 text-white flex flex-col fixed left-0 top-0">
      {/* Zona del Logo y Saludo */}
      <div className="h-24 flex flex-col items-center justify-center font-bold tracking-wide border-b border-green-600/50">
        <span className="text-2xl">AseguraSimple</span>
        {user && <span className="text-sm font-normal text-green-200 mt-1">Hola, {user.nombre}</span>}
      </div>

      {/* Zona de Navegación */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Lógica para saber si este botón es el de la pantalla actual
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-green-800/80 font-bold border-l-4 border-white pl-3' // Estilo ACTIVO
                  : 'hover:bg-green-600/50 font-medium border-l-4 border-transparent' // Estilo INACTIVO
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-green-100'} />
              <span className={isActive ? 'text-white' : 'text-green-50'}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Zona de Cerrar Sesión */}
      <div className="p-4 border-t border-green-600/50 mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-green-800 transition-colors text-left text-green-50"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}