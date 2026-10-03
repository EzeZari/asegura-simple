"use client";

import { Clock, History, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Props {
  actividades?: any[];
}

export default function PolizaHistorial({ actividades = [] }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Si no hay actividades, mostramos el cajón vacío y prolijo
  if (!actividades || actividades.length === 0) {
    return (
      <div className="p-5 md:p-8 border border-gray-100 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <h3 className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px] md:text-xs tracking-widest mb-5 md:mb-6 flex items-center gap-2">
          <History size={16} /> Registro de Actividad y Avisos
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">
          Aún no hay registros de actividad para esta póliza.
        </p>
      </div>
    );
  }

  // 🔥 LÓGICA DE VISIBILIDAD INTELIGENTE
  const MAX_VISIBLE = 3;
  const hasMore = actividades.length > MAX_VISIBLE;
  const visibleActivities = isExpanded ? actividades : actividades.slice(0, MAX_VISIBLE);

  return (
    <div className="p-5 md:p-8 border border-gray-100 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800 shadow-sm transition-colors">
      
      <h3 className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px] md:text-xs tracking-widest mb-5 md:mb-6 flex items-center gap-2 m-0 transition-colors">
        <History size={16} /> Registro de Actividad y Avisos ({actividades.length})
      </h3>
      
      <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
        {visibleActivities.map((act, index) => (
          <div key={act.id} className="flex gap-3 text-sm relative group">
            {/* Línea conectora inteligente (se oculta en el último elemento visible) */}
            {index !== visibleActivities.length - 1 && (
              <div className="absolute left-2 top-6 bottom-[-16px] w-[2px] bg-gray-100 dark:bg-gray-700"></div>
            )}
            
            <div className="mt-0.5 z-10 bg-white dark:bg-gray-800 p-0.5 rounded-full">
              <Clock size={14} className="text-blue-500" />
            </div>
            
            <div className="pb-3">
              <p className="font-medium text-gray-900 dark:text-gray-100 text-xs md:text-sm">{act.descripcion}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] md:text-xs text-gray-500 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {act.entidad}
                </span>
                <span className="text-[10px] md:text-xs text-gray-400">
                  {new Date(act.fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 BOTÓN DESPLEGABLE (Solo aparece si hay más de 3 actividades) */}
      {hasMore && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2 flex items-center justify-center gap-1 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          {isExpanded ? (
            <>Ocultar historial antiguo <ChevronUp size={14} /></>
          ) : (
            <>Ver {actividades.length - MAX_VISIBLE} actividades anteriores <ChevronDown size={14} /></>
          )}
        </button>
      )}
    </div>
  );
}