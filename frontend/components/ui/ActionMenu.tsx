import { MoreHorizontal } from "lucide-react";
import { ReactNode } from "react";

export function ActionMenu({ isOpen, onToggle, children }: { isOpen: boolean, onToggle: () => void, children: ReactNode }) {
  return (
    <div className="relative flex justify-end">
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="text-gray-400 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-lg"
      >
        <MoreHorizontal size={20} />
      </button>
      {isOpen && (
        <div className="absolute right-8 top-2 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
          {children}
        </div>
      )}
    </div>
  );
}

export function ActionMenuItem({ icon: Icon, label, onClick, color = "default" }: { icon: any, label: string, onClick: () => void, color?: "default" | "red" | "green" | "amber" }) {
  const colorClasses = {
    default: "text-gray-700 hover:bg-gray-50",
    red: "text-red-600 hover:bg-red-50",
    green: "text-emerald-600 hover:bg-emerald-50",
    amber: "text-amber-600 hover:bg-amber-50"
  }[color];

  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${colorClasses}`}>
      <Icon size={14} /> {label}
    </button>
  );
}

export function ActionMenuDivider() {
  return <div className="h-px bg-gray-100 my-1"></div>;
}