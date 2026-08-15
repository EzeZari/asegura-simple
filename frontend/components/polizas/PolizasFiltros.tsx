"use client";

import { Search, Filter } from "lucide-react";

interface FiltrosProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filtroRama: string;
  setFiltroRama: (value: string) => void;
  filtroEstado: string;
  setFiltroEstado: (value: string) => void;
}

export default function PolizasFiltros({
  searchTerm, setSearchTerm, filtroRama, setFiltroRama, filtroEstado, setFiltroEstado,
}: FiltrosProps) {
  return (
    // 🔥 Adaptado a fondo oscuro
    <div className="flex flex-col xl:flex-row items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm w-full transition-colors">
      
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Buscar..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-10 pr-4 py-2.5 lg:py-2 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-all text-sm lg:text-base" 
        />
      </div>

      <div className="flex items-center gap-3 w-full xl:w-auto">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 px-3 py-2.5 lg:py-2 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 xl:flex-none transition-colors">
          <Filter size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
          <select 
            value={filtroRama} 
            onChange={(e) => setFiltroRama(e.target.value)}
            className="bg-transparent text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-200 outline-none cursor-pointer w-full transition-colors"
          >
            <option value="Todas" className="dark:bg-gray-800">Todas las ramas</option>
            <option value="Automotor" className="dark:bg-gray-800">Automotor</option>
            <option value="Motovehículo" className="dark:bg-gray-800">Motovehículo</option>
            <option value="Combinado Familiar" className="dark:bg-gray-800">Combinado Familiar</option>
            <option value="Vida" className="dark:bg-gray-800">Vida</option>
            <option value="ART" className="dark:bg-gray-800">ART</option>
            <option value="Integral de Comercio" className="dark:bg-gray-800">Integral de Comercio</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 px-3 py-2.5 lg:py-2 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 xl:flex-none transition-colors">
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            filtroEstado === 'Vigente' || filtroEstado === 'Renovada' ? 'bg-emerald-500' : 
            filtroEstado === 'Próxima a Vencer' ? 'bg-orange-500' : 
            filtroEstado === 'Pendiente de Pago' ? 'bg-amber-500' : 
            filtroEstado === 'Vencida' || filtroEstado === 'Anulada' ? 'bg-red-500' : 'bg-gray-400 dark:bg-gray-500'
          }`}></div>
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-transparent text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-200 outline-none cursor-pointer w-full transition-colors"
          >
            <option value="Todos" className="dark:bg-gray-800">Todos los estados</option>
            <option value="Vigente" className="dark:bg-gray-800">Vigente</option>
            <option value="Próxima a Vencer" className="dark:bg-gray-800">Próxima a Vencer</option>
            <option value="Vencida" className="dark:bg-gray-800">Vencida</option>
            <option value="Pendiente de Pago" className="dark:bg-gray-800">Pendiente de Pago</option>
            <option value="Renovada" className="dark:bg-gray-800">Renovada</option>
            <option value="Anulada" className="dark:bg-gray-800">Anulada</option>
          </select>
        </div>
      </div>
    </div>
  );
}