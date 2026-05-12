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
  const estilos = {
    vencida: { borde: "border-rose-200", icono: "text-rose-600", titulo: "text-rose-900", badgeBg: "bg-rose-100", badgeText: "text-rose-700" },
    critica: { borde: "border-orange-200", icono: "text-orange-500", titulo: "text-orange-900", badgeBg: "bg-orange-100", badgeText: "text-orange-700" },
    proxima: { borde: "border-amber-200", icono: "text-amber-500", titulo: "text-amber-900", badgeBg: "bg-amber-100", badgeText: "text-amber-700" }
  }[nivel];

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className={`flex items-center gap-2 border-b ${estilos.borde} pb-2`}>
        <Icono className={estilos.icono} size={24} />
        <h2 className={`text-xl font-bold ${estilos.titulo}`}>{titulo}</h2>
        <span className={`${estilos.badgeBg} ${estilos.badgeText} font-bold px-2 py-0.5 rounded-full text-sm ml-2`}>
          {alertas.length}
        </span>
      </div>

      {alertas.length === 0 ? (
        <p className="text-gray-400 italic py-2">{mensajeVacio}</p>
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