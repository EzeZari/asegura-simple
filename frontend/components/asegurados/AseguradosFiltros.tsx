"use client";

import { Search, Filter } from "lucide-react";

interface FiltrosProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filtroTipo: string;
  setFiltroTipo: (value: string) => void;
  filtroEstado: string;
  setFiltroEstado: (value: string) => void;
}

export default function AseguradosFiltros({
  searchTerm, setSearchTerm, filtroTipo, setFiltroTipo, filtroEstado, setFiltroEstado,
}: FiltrosProps) {
  return (
    // 🔥 Adaptado: bg-white -> dark:bg-gray-800 y bordes oscuros
    <div className="flex flex-col lg:flex-row items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm w-full transition-colors duration-300">
      
      {/* Buscador de texto */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nombre o DNI..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          // 🔥 Adaptado: input transparente o color oscuro, texto blanco
          className="w-full pl-10 pr-4 py-2.5 lg:py-2 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 outline-none transition-all text-sm lg:text-base" 
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
        {/* Selector Tipo */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 px-3 py-2.5 lg:py-2 rounded-lg border border-gray-200 dark:border-gray-700 w-full sm:flex-1 lg:w-auto transition-colors">
          <Filter size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
          <select 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none cursor-pointer w-full"
          >
            <option value="Todos" className="dark:bg-gray-800">Todos los tipos</option>
            <option value="Individuo" className="dark:bg-gray-800">Individuos</option>
            <option value="Empresa" className="dark:bg-gray-800">Empresas</option>
          </select>
        </div>

        {/* Selector Estado */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 px-3 py-2.5 lg:py-2 rounded-lg border border-gray-200 dark:border-gray-700 w-full sm:flex-1 lg:w-auto transition-colors">
          <div className={`w-2 h-2 rounded-full shrink-0 ${filtroEstado === 'Activos' ? 'bg-green-500' : filtroEstado === 'Inactivos' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none cursor-pointer w-full"
          >
            <option value="Todos" className="dark:bg-gray-800">Todos los estados</option>
            <option value="Activos" className="dark:bg-gray-800">Activos</option>
            <option value="Inactivos" className="dark:bg-gray-800">Inactivos</option>
          </select>
        </div>
      </div>
    </div>
  );
}