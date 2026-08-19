"use client";

import { ElementType, useState } from "react";
import AlertaCard from "./AlertaCard";
import AlertaListRow from "./AlertaListRow";

interface Props {
  titulo: string;
  Icono: ElementType;
  nivel: "vencida" | "critica" | "proxima";
  alertas?: any[]; 
  mensajeVacio: string;
  vista: "lista" | "tarjetas";
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: (ids: number[], isSelecting: boolean) => void;
}

export default function AlertaSection({ titulo, Icono, nivel, alertas = [], mensajeVacio, vista, selectedIds, onToggleSelect, onToggleSelectAll }: Props) {
  const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);

  const estilos = {
    vencida: { borde: "border-rose-200 dark:border-rose-900/50", icono: "text-rose-600 dark:text-rose-500", titulo: "text-rose-900 dark:text-rose-400", badgeBg: "bg-rose-100 dark:bg-rose-900/30", badgeText: "text-rose-700 dark:text-rose-400" },
    critica: { borde: "border-orange-200 dark:border-orange-900/50", icono: "text-orange-500 dark:text-orange-500", titulo: "text-orange-900 dark:text-orange-400", badgeBg: "bg-orange-100 dark:bg-orange-900/30", badgeText: "text-orange-700 dark:text-orange-400" },
    proxima: { borde: "border-amber-200 dark:border-amber-900/50", icono: "text-amber-500 dark:text-amber-500", titulo: "text-amber-900 dark:text-amber-400", badgeBg: "bg-amber-100 dark:bg-amber-900/30", badgeText: "text-amber-700 dark:text-amber-400" }
  }[nivel];

  const allCurrentIds = alertas.map(a => a.id);
  const isAllSelected = alertas.length > 0 && alertas.every(a => selectedIds.includes(a.id));

  return (
    <div className="flex flex-col gap-4 transition-colors">
      <div className={`flex items-center gap-2 border-b ${estilos.borde} pb-2 transition-colors`}>
        <Icono className={estilos.icono} size={24} />
        <h2 className={`text-xl font-bold ${estilos.titulo} transition-colors`}>{titulo}</h2>
        <span className={`${estilos.badgeBg} ${estilos.badgeText} font-bold px-2 py-0.5 rounded-full text-sm ml-2 transition-colors`}>
          {alertas.length}
        </span>
      </div>

      {alertas.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 italic py-2 transition-colors">{mensajeVacio}</p>
      ) : vista === "tarjetas" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {alertas.map(poliza => (
            <AlertaCard key={poliza.id} poliza={poliza} nivel={nivel} isSelected={selectedIds.includes(poliza.id)} onSelect={() => onToggleSelect(poliza.id)} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 text-[10px] md:text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    onChange={(e) => onToggleSelectAll(allCurrentIds, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                  />
                </th>
                <th className="p-4 font-bold whitespace-nowrap">Cliente / Póliza</th>
                <th className="p-4 font-bold whitespace-nowrap">Tipo y Compañía</th>
                <th className="p-4 font-bold whitespace-nowrap">N° de Póliza</th>
                <th className="p-4 font-bold whitespace-nowrap">Vehículo / Detalles</th>
                <th className="p-4 font-bold whitespace-nowrap">Vence el</th>
                <th className="p-4 font-bold whitespace-nowrap">Días restantes</th>
                <th className="p-4 font-bold text-right whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {alertas.map(poliza => (
                <AlertaListRow 
                  key={poliza.id} 
                  poliza={poliza} 
                  nivel={nivel} 
                  menuAbiertoId={menuAbiertoId}
                  onToggleMenu={setMenuAbiertoId}
                  isSelected={selectedIds.includes(poliza.id)}
                  onSelect={() => onToggleSelect(poliza.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}