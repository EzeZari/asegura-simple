"use client";

import { Search, Filter, List, LayoutGrid, CalendarDays, Clock, CheckCircle2, LayoutList } from "lucide-react";

const RAMAS_DISPONIBLES = [
  "Accidentes personales", "ART", "Automotor", "Cascos", "Caución", 
  "Combinado familiar", "Ecomovilidad", "Incendio", "Integral para comercio", 
  "Motovehículo", "Responsabilidad civil", "Robo", "Seguro técnico", 
  "Transporte", "Vida colectivo", "Vida individual", "Vida simple"
];

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filtroGestion: string;
  setFiltroGestion: (v: string) => void;
  filtroRama: string;
  setFiltroRama: (v: string) => void;
  filtroCompania: string;
  setFiltroCompania: (v: string) => void;
  companiasUnicas: string[];
  vista: "lista" | "tarjetas" | "calendario";
  cambiarVista: (v: "lista" | "tarjetas" | "calendario") => void;
}

export default function AlertasFiltros({
  searchTerm, setSearchTerm,
  filtroGestion, setFiltroGestion,
  filtroRama, setFiltroRama,
  filtroCompania, setFiltroCompania,
  companiasUnicas,
  vista, cambiarVista
}: Props) {
  
  const estiloRama = filtroRama !== "TODAS" 
    ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 font-bold" 
    : "bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 font-medium";

  const estiloCia = filtroCompania !== "TODAS" 
    ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 font-bold" 
    : "bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 font-medium";

  return (
    <div className="flex flex-col xl:flex-row items-center gap-3 w-full">
      
      {/* Buscador */}
      <div className="relative w-full xl:w-56 shrink-0">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" placeholder="Buscar póliza..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm transition-colors shadow-sm"
        />
      </div>

      <div className="flex items-center gap-3 w-full overflow-x-auto pb-1 xl:pb-0 hide-scrollbar">
        
        {/* 🔥 NUEVO DISEÑO: Pestañas de Gestión (Soporta íconos y cambia de color) */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-200 dark:border-gray-800 shrink-0">
          <button
            onClick={() => setFiltroGestion("PENDIENTES")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm transition-all ${
              filtroGestion === "PENDIENTES" 
                ? "bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-500 font-bold shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
            }`}
          >
            <Clock size={14} /> Pendientes
          </button>
          <button
            onClick={() => setFiltroGestion("GESTIONADAS")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm transition-all ${
              filtroGestion === "GESTIONADAS" 
                ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-500 font-bold shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
            }`}
          >
            <CheckCircle2 size={14} /> Gestionadas
          </button>
          <button
            onClick={() => setFiltroGestion("TODAS")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm transition-all ${
              filtroGestion === "TODAS" 
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
            }`}
          >
            <LayoutList size={14} /> Todas
          </button>
        </div>

        {/* Filtros de Rama y Cía (Limpios y sin emojis) */}
        <div className="relative flex-1 min-w-[140px] shrink-0">
          <Filter size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${filtroRama !== 'TODAS' ? 'text-current' : 'text-gray-400'}`} />
          <select 
            value={filtroRama} 
            onChange={(e) => setFiltroRama(e.target.value)} 
            className={`w-full pl-8 pr-3 py-2.5 rounded-xl outline-none text-sm cursor-pointer appearance-none shadow-sm transition-colors border ${estiloRama}`}
          >
            <option value="TODAS">Todas las Ramas</option>
            {RAMAS_DISPONIBLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="relative flex-1 min-w-[140px] shrink-0">
          <Filter size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${filtroCompania !== 'TODAS' ? 'text-current' : 'text-gray-400'}`} />
          <select 
            value={filtroCompania} 
            onChange={(e) => setFiltroCompania(e.target.value)} 
            className={`w-full pl-8 pr-3 py-2.5 rounded-xl outline-none text-sm cursor-pointer appearance-none shadow-sm transition-colors border ${estiloCia}`}
          >
            <option value="TODAS">Todas las Cías.</option>
            {companiasUnicas.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Selectores de Vista */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={() => cambiarVista("lista")} className={`flex justify-center p-2 rounded-lg transition-all ${vista === "lista" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} title="Vista de Lista"><List size={16} /></button>
        <button onClick={() => cambiarVista("tarjetas")} className={`flex justify-center p-2 rounded-lg transition-all ${vista === "tarjetas" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} title="Vista de Tarjetas"><LayoutGrid size={16} /></button>
        <button onClick={() => cambiarVista("calendario")} className={`flex justify-center p-2 rounded-lg transition-all ${vista === "calendario" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} title="Vista de Calendario"><CalendarDays size={16} /></button>
      </div>
    </div>
  );
}