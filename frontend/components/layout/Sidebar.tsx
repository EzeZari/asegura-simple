"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; 
import { 
  Home, Users, FileText, Building, CarFront, Bell, Settings, LogOut, BarChart3, X 
} from 'lucide-react'; 
import { useAuthStore } from '@/store/authStore';

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

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', 
      });
      
      // 🔥 ACÁ ESTÁ LA MAGIA: Borramos el "sello" del frontend poniéndole fecha de 1970
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
        
        <button 
          onClick={onClose} 
          className="lg:hidden absolute top-5 right-4 p-1 text-green-100 hover:text-white hover:bg-green-600 rounded-md transition-colors"
        >
          <X size={24} />
        </button>

        <div className="h-24 flex flex-col items-center justify-center font-bold tracking-wide border-b border-green-600/50">
          <span className="text-2xl">AseguraSimple</span>
          {user && <span className="text-sm font-normal text-green-200 mt-1">Hola, {user.nombre}</span>}
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