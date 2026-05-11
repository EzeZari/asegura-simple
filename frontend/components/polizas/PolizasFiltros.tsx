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
  searchTerm,
  setSearchTerm,
  filtroRama,
  setFiltroRama,
  filtroEstado,
  setFiltroEstado,
}: FiltrosProps) {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nro de póliza o nombre del titular..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all" 
        />
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <Filter size={16} className="text-gray-400" />
          <select 
            value={filtroRama} 
            onChange={(e) => setFiltroRama(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer w-full"
          >
            <option value="Todas">Todas las ramas</option>
            <option value="Automotor">Automotor</option>
            <option value="Moto">Motovehículo</option>
            <option value="Hogar">Combinado Familiar</option>
            <option value="Vida">Vida</option>
            <option value="ART">ART</option>
            <option value="Comercio">Integral de Comercio</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <div className={`w-2 h-2 rounded-full ${
            filtroEstado === 'Vigente' || filtroEstado === 'Renovada' ? 'bg-green-500' : 
            filtroEstado === 'Pendiente de Pago' ? 'bg-amber-500' : 
            filtroEstado === 'Anulada' ? 'bg-red-500' : 'bg-gray-400'
          }`}></div>
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer w-full"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Vigente">Vigente</option>
            <option value="Pendiente de Pago">Pendiente de Pago</option>
            <option value="Renovada">Renovada</option>
            <option value="Anulada">Anulada</option>
          </select>
        </div>
      </div>
    </div>
  );
}