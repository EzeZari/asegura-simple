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
    <div className="flex flex-col lg:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full">
      {/* Buscador de texto */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nombre o DNI..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-10 pr-4 py-2.5 lg:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition-all text-sm lg:text-base" 
        />
      </div>

      {/* Filtros desplegables */}
      {/* 🔥 Ajuste: flex-col en celulares ultra chicos, flex-row en medianos (sm) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5 lg:py-2 rounded-lg border border-gray-200 w-full sm:flex-1 lg:w-auto">
          <Filter size={16} className="text-gray-400 shrink-0" />
          <select 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer w-full"
          >
            <option value="Todos">Todos los tipos</option>
            <option value="Individuo">Individuos</option>
            <option value="Empresa">Empresas</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5 lg:py-2 rounded-lg border border-gray-200 w-full sm:flex-1 lg:w-auto">
          <div className={`w-2 h-2 rounded-full shrink-0 ${filtroEstado === 'Activos' ? 'bg-green-500' : filtroEstado === 'Inactivos' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer w-full"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activos">Activos</option>
            <option value="Inactivos">Inactivos</option>
          </select>
        </div>
      </div>
    </div>
  );
}