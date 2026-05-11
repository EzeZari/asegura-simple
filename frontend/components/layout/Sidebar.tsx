"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Users, 
  FileText, 
  Building, // <-- Importamos el ícono del edificio
  Bell, 
  LayoutDashboard, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
  { name: 'Inicio', icon: Home, path: '/' },
  { name: 'Asegurados', icon: Users, path: '/asegurados' },
  { name: 'Pólizas', icon: FileText, path: '/polizas' },
  { name: 'Compañías', icon: Building, path: '/companias' }, // <-- Agregamos Compañías acá
  { name: 'Alertas', icon: Bell, path: '/alertas' },
  { name: 'Panel de control', icon: LayoutDashboard, path: '/panel' },
  { name: 'Configuración', icon: Settings, path: '/configuracion' },
];

export default function Sidebar() {
  const router = useRouter();
  
  // Traemos al usuario y la función para limpiar la memoria de Zustand
  const user = useAuthStore((state) => state.user);
  const clearStore = useAuthStore((state) => state.logout);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      // 1. Le avisamos al backend que destruya la cookie segura
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include', 
      });
      
      // 2. Borramos al usuario de la memoria global (Zustand)
      clearStore();

      // 3. Lo mandamos al login
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <aside className="w-64 h-screen bg-green-700 text-white flex flex-col fixed left-0 top-0">
      {/* Zona del Logo y Saludo */}
      <div className="h-24 flex flex-col items-center justify-center font-bold tracking-wide border-b border-green-600/50">
        <span className="text-2xl">Logo</span>
        {user && <span className="text-sm font-normal text-green-200 mt-1">Hola, {user.nombre}</span>}
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