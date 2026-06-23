"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; 
import { 
  Home, Users, FileText, Building, CarFront, Bell, Settings, LogOut, BarChart3, X, Eye, ShieldCheck 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { PERMISOS, tienePermiso } from '@/utils/roles'; // 🔥 IMPORTAMOS EL DICCIONARIO

const menuItems = [
  { name: 'Inicio', icon: Home, path: '/' },
  { name: 'Asegurados', icon: Users, path: '/asegurados' },
  { name: 'Pólizas', icon: FileText, path: '/polizas' },
  { name: 'Siniestros', icon: CarFront, path: '/siniestros' }, 
  { name: 'Compañías', icon: Building, path: '/companias' }, 
  { name: 'Alertas', icon: Bell, path: '/alertas' },
  { name: 'Estadísticas', icon: BarChart3, path: '/estadisticas' },
  { name: 'Configuración', icon: Settings, path: '/configuracion' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname(); 
  
  const user = useAuthStore((state) => state.user);
  const clearStore = useAuthStore((state) => state.logout);
  
  // 🔥 LÓGICA DE ROLES Y ETIQUETAS USANDO NUESTRA HERRAMIENTA SENIOR
  const esSoloLectura = user?.role === 'VIEWER';
  
  const esDueno = tienePermiso(user, PERMISOS.PUEDE_EDITAR_PLAN);
  const puedeModificar = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);
  
  // Un admin secundario es alguien que PUEDE modificar, pero NO ES dueño
  const esAdminSecundario = puedeModificar && !esDueno;

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', 
      });
      
      document.cookie = "next_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      clearStore();
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        w-64 h-screen bg-green-700 text-white flex flex-col fixed left-0 top-0 z-50 
        transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 
      `}>
        
        <div className="relative h-auto py-6 flex flex-col items-center justify-center font-bold tracking-wide border-b border-green-600/50 px-4 text-center">
          <button 
            onClick={onClose} 
            className="lg:hidden absolute top-2 right-2 p-1.5 text-green-100 hover:text-white hover:bg-green-600 rounded-lg transition-colors"
          >
            <X size={22} />
          </button>
          
          <span className="text-2xl mt-1">AseguraSimple</span>
          {user && (
            <div className="flex flex-col items-center mt-1">
              <span className="text-sm font-normal text-green-200 truncate w-full max-w-[180px]">
                Hola, {user.nombre}
              </span>
              
              {/* 🔥 ETIQUETA: MODO LECTOR */}
              {esSoloLectura && (
                <span className="mt-2 flex items-center gap-1.5 bg-black/20 text-green-50 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <Eye size={12} /> Modo Lector
                </span>
              )}

              {/* 🔥 ETIQUETA: ADMIN SECUNDARIO */}
              {esAdminSecundario && (
                <span className="mt-2 flex items-center gap-1.5 bg-blue-900/40 border border-blue-400/20 text-blue-50 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <ShieldCheck size={12} /> Admin Secundario
                </span>
              )}
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose} 
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-green-800/80 font-bold border-l-4 border-white pl-3' 
                    : 'hover:bg-green-600/50 font-medium border-l-4 border-transparent' 
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-green-100'} />
                <span className={isActive ? 'text-white' : 'text-green-50'}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

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
    </>
  );
}