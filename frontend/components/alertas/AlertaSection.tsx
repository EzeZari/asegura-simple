"use client";

import { ElementType } from "react";
import AlertaCard from "./AlertaCard";

interface Props {
  titulo: string;
  Icono: ElementType;
  nivel: "vencida" | "critica" | "proxima";
  alertas?: any[]; 
  mensajeVacio: string;
}

export default function AlertaSection({ titulo, Icono, nivel, alertas = [], mensajeVacio }: Props) {
  // 🔥 Adaptación de estilos para el encabezado de cada sección
  const estilos = {
    vencida: { borde: "border-rose-200 dark:border-rose-900/50", icono: "text-rose-600 dark:text-rose-500", titulo: "text-rose-900 dark:text-rose-400", badgeBg: "bg-rose-100 dark:bg-rose-900/30", badgeText: "text-rose-700 dark:text-rose-400" },
    critica: { borde: "border-orange-200 dark:border-orange-900/50", icono: "text-orange-500 dark:text-orange-500", titulo: "text-orange-900 dark:text-orange-400", badgeBg: "bg-orange-100 dark:bg-orange-900/30", badgeText: "text-orange-700 dark:text-orange-400" },
    proxima: { borde: "border-amber-200 dark:border-amber-900/50", icono: "text-amber-500 dark:text-amber-500", titulo: "text-amber-900 dark:text-amber-400", badgeBg: "bg-amber-100 dark:bg-amber-900/30", badgeText: "text-amber-700 dark:text-amber-400" }
  }[nivel];

  return (
    <div className="flex flex-col gap-4 mt-4 transition-colors">
      <div className={`flex items-center gap-2 border-b ${estilos.borde} pb-2 transition-colors`}>
        <Icono className={estilos.icono} size={24} />
        <h2 className={`text-xl font-bold ${estilos.titulo} transition-colors`}>{titulo}</h2>
        <span className={`${estilos.badgeBg} ${estilos.badgeText} font-bold px-2 py-0.5 rounded-full text-sm ml-2 transition-colors`}>
          {alertas.length}
        </span>
      </div>

      {alertas.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 italic py-2 transition-colors">{mensajeVacio}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {alertas.map(poliza => (
            <AlertaCard key={poliza.id} poliza={poliza} nivel={nivel} />
          ))}
        </div>
      )}
    </div>
  );
}