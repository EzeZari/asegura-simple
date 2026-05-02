import Link from 'next/link';
import { 
  Home, 
  Users, 
  FileText, 
  Bell, 
  LayoutDashboard, 
  Settings 
} from 'lucide-react';

// Centralizamos los links acá para que sea fácil agregar o sacar en el futuro
const menuItems = [
  { name: 'Inicio', icon: Home, path: '/' },
  { name: 'Asegurados', icon: Users, path: '/asegurados' },
  { name: 'Pólizas', icon: FileText, path: '/polizas' },
  { name: 'Alertas', icon: Bell, path: '/alertas' },
  { name: 'Panel de control', icon: LayoutDashboard, path: '/panel' },
  { name: 'Configuración', icon: Settings, path: '/configuracion' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-green-700 text-white flex flex-col fixed left-0 top-0">
      {/* Zona del Logo */}
      <div className="h-24 flex items-center justify-center font-bold text-2xl tracking-wide">
        Logo
      </div>

      {/* Zona de Navegación */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
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
    </aside>
  );
}