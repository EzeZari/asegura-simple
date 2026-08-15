import { MoreHorizontal } from "lucide-react";
import { ReactNode } from "react";

export function ActionMenu({ isOpen, onToggle, children }: { isOpen: boolean, onToggle: () => void, children: ReactNode }) {
  return (
    <div className="relative flex justify-end">
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors p-2 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg"
      >
        <MoreHorizontal size={20} />
      </button>
      {isOpen && (
        // 🔥 Fondo oscuro y borde oscuro para el menú
        <div className="absolute right-8 top-2 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden py-1 transition-colors">
          {children}
        </div>
      )}
    </div>
  );
}

export function ActionMenuItem({ icon: Icon, label, onClick, color = "default" }: { icon: any, label: string, onClick: () => void, color?: "default" | "red" | "green" | "amber" }) {
  // 🔥 Adaptamos todos los colores y sus hover
  const colorClasses = {
    default: "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50",
    red: "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30",
    green: "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30",
    amber: "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30"
  }[color];

  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${colorClasses}`}>
      <Icon size={14} /> {label}
    </button>
  );
}

export function ActionMenuDivider() {
  return <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 transition-colors"></div>;
}