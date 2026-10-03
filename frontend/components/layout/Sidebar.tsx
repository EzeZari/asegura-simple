"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; 
import { 
  Home, Users, FileText, Building, CarFront, Bell, Settings, LogOut, BarChart3, X, Eye, ShieldCheck, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { PERMISOS, tienePermiso } from '@/utils/roles';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { name: 'Inicio', icon: Home, path: '/inicio' },
  { name: 'Asegurados', icon: Users, path: '/asegurados' },
  { name: 'Pólizas', icon: FileText, path: '/polizas' },
  { name: 'Siniestros', icon: CarFront, path: '/siniestros' }, 
  { name: 'Compañías', icon: Building, path: '/companias' }, 
  { name: 'Alertas', icon: Bell, path: '/alertas' },
  { name: 'Estadísticas', icon: BarChart3, path: '/estadisticas' },
  { name: 'Configuración', icon: Settings, path: '/configuracion' },
];

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname(); 
  
  const user = useAuthStore((state) => state.user);
  const clearStore = useAuthStore((state) => state.logout);
  
  const esSoloLectura = user?.role === 'VIEWER';
  const esDueno = tienePermiso(user, PERMISOS.PUEDE_EDITAR_PLAN);
  const puedeModificar = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);
  const esAdminSecundario = puedeModificar && !esDueno;

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', 
      });
      
      document.cookie = "next_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      if (typeof window !== "undefined" && (window as any).$crisp) {
        (window as any).$crisp.push(["do", "session:reset"]);
      }
      
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

      {/* 🔥 REGLA DE ANCHO CORREGIDA: lg:w-20 w-64 asegura que en móvil siempre mida 64 */}
      <aside className={`
        tour-sidebar
        ${isCollapsed ? 'lg:w-20 w-64' : 'w-64'} h-screen bg-green-700 text-white flex flex-col fixed left-0 top-0 z-50 
        transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 
      `}>
        
        {/* BOTÓN FLOTANTE PARA COLAPSAR */}
        <button 
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center absolute -right-3 top-8 bg-green-900 border-2 border-green-600 text-white h-7 w-7 rounded-full hover:bg-green-600 hover:scale-110 transition-all z-50 shadow-md"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`relative flex flex-col items-center justify-center font-bold tracking-wide border-b border-green-600/50 text-center transition-all ${isCollapsed ? 'py-4 min-h-[80px]' : 'py-6 px-4'}`}>
          <button 
            onClick={onClose} 
            className="lg:hidden absolute top-2 right-2 p-1.5 text-green-100 hover:text-white hover:bg-green-600 rounded-lg transition-colors"
          >
            <X size={22} />
          </button>
          
          {/* 🔥 EL NUEVO LOGO "AS" MUCHO MÁS PROFESIONAL */}
          {isCollapsed ? (
            <div 
              className="w-11 h-11 bg-white text-green-700 flex items-center justify-center rounded-xl shadow-lg font-black text-xl tracking-tighter cursor-default mt-2" 
              title="AseguraSimple"
            >
              AS
            </div>
          ) : (
            <>
              <span className="text-2xl mt-1 whitespace-nowrap overflow-hidden">AseguraSimple</span>
              {user && (
                <div className="flex flex-col items-center mt-1 overflow-hidden">
                  <span className="text-sm font-normal text-green-200 truncate w-full max-w-[180px]">
                    Hola, {user.nombre}
                  </span>
                  
                  {esSoloLectura && (
                    <span className="mt-2 flex items-center gap-1.5 bg-black/20 text-green-50 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      <Eye size={12} /> Modo Lector
                    </span>
                  )}

                  {esAdminSecundario && (
                    <span className="mt-2 flex items-center gap-1.5 bg-blue-900/40 border border-blue-400/20 text-blue-50 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      <ShieldCheck size={12} /> Admin Secundario
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto hide-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            const isConfig = item.path === '/configuracion';

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-4 px-4'} py-3 rounded-lg transition-all ${
                  isActive 
                    ? `bg-green-800/80 font-bold border-l-4 border-white ${isCollapsed ? '' : 'pl-3'}` 
                    : 'hover:bg-green-600/50 font-medium border-l-4 border-transparent' 
                } ${isConfig ? 'tour-configuracion' : ''}`}
              >
                <Icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-green-100'}`} />
                {!isCollapsed && <span className={`whitespace-nowrap overflow-hidden ${isActive ? 'text-white' : 'text-green-50'}`}>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* PIE DEL SIDEBAR */}
        <div className={`p-4 border-t border-green-600/50 mt-auto flex flex-col gap-2 ${isCollapsed ? 'items-center px-2' : ''}`}>
          
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'justify-between px-4'} py-2 rounded-lg bg-green-800/40 text-green-50 overflow-hidden`} title={isCollapsed ? "Cambiar tema" : undefined}>
            {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Modo Oscuro</span>}
            <ThemeToggle />
          </div>

          <button 
            onClick={handleLogout}
            title={isCollapsed ? "Cerrar sesión" : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-4 px-4'} py-3 rounded-lg hover:bg-green-800 transition-colors text-left text-green-50`}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}