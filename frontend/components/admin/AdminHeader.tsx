import { ShieldCheck, LogOut } from "lucide-react";

interface AdminHeaderProps {
  onLogout: () => void;
}

export default function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/10 p-2 md:p-2.5 rounded-xl border border-green-500/20 text-green-500 shadow-inner">
            <ShieldCheck size={24} className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-white tracking-tight">Backoffice</h1>
            <p className="text-[10px] md:text-xs text-green-500 font-bold tracking-wider uppercase">Super Admin</p>
          </div>
        </div>
        <button 
          onClick={onLogout} 
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-400 bg-gray-800/50 hover:bg-red-500/10 px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut size={16} /> 
          <span className="hidden sm:inline">Salir del Panel</span>
        </button>
      </div>
    </header>
  );
}