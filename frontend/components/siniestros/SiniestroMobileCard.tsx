"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, Clock, CheckCircle, Edit, Trash2, Eye, ChevronRight } from "lucide-react";
import { ActionMenu, ActionMenuItem, ActionMenuDivider } from "@/components/ui/ActionMenu";

interface Props {
  siniestro: any;
  menuAbiertoId: number | null;
  onToggleMenu: (id: number | null) => void;
  puedeModificar: boolean;
  onEdit?: (siniestro: any) => void;
  onEliminar?: (siniestro: any) => void;
}

export default function SiniestroMobileCard({ 
  siniestro, menuAbiertoId, onToggleMenu, puedeModificar, onEdit, onEliminar 
}: Props) {
  const router = useRouter();

  const poliza = siniestro.poliza || {};
  const asegurado = poliza.asegurado || {};

  // Colores para el borde izquierdo
  const getBorderColor = (estado: string) => {
    switch (estado) {
      case "Denuncia Pendiente": return "bg-orange-500";
      case "En Análisis": return "bg-blue-500";
      case "Aprobado": 
      case "Pagado": return "bg-emerald-500";
      case "Rechazado": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  // Badges estilizados
  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Denuncia Pendiente": return <span className="bg-orange-100/50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Pendiente</span>;
      case "En Análisis": return <span className="bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={12}/> Análisis</span>;
      case "Aprobado": return <span className="bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Aprobado</span>;
      case "Pagado": return <span className="bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Pagado</span>;
      case "Rechazado": return <span className="bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-0.5 rounded-full text-xs font-bold w-fit">Rechazado</span>;
      default: return <span className="bg-gray-100/50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-xs font-bold w-fit">{estado}</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden transition-colors">
      
      {/* 🔥 Indicador lateral dinámico */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getBorderColor(siniestro.estadoSiniestro)}`}></div>

      {/* 1. Encabezado: Número y Menú */}
      <div className="pl-5 pr-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/30">
        <div className="flex flex-col">
          <span className="font-bold text-orange-600 dark:text-orange-500 text-base">{siniestro.nroSiniestro}</span>
          <span className="font-mono text-gray-500 dark:text-gray-400 text-xs mt-0.5">{new Date(siniestro.fechaHecho).toLocaleDateString("es-AR")}</span>
        </div>
        
        {puedeModificar && (
          <div className="-mr-2 relative shrink-0">
            <ActionMenu isOpen={menuAbiertoId === siniestro.id} onToggle={() => onToggleMenu(menuAbiertoId === siniestro.id ? null : siniestro.id)}>
              <ActionMenuItem icon={Eye} label="Ver Expediente" onClick={() => router.push(`/siniestros/${siniestro.id}`)} />
              <ActionMenuItem icon={Edit} label="Editar Datos" onClick={() => onEdit?.(siniestro)} />
              <ActionMenuDivider />
              <ActionMenuItem icon={Trash2} label="Eliminar" color="red" onClick={() => onEliminar?.(siniestro)} />
            </ActionMenu>
          </div>
        )}
      </div>

      {/* 2. Cuerpo: Datos estructurados tipo lista/ticket */}
      <div className="pl-5 pr-4 flex flex-col divide-y divide-gray-100 dark:divide-gray-700/60">
        
        {/* Titular */}
        <div className="py-3 flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Titular</span>
          <div className="text-right">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-200 truncate max-w-[160px]">{asegurado.nombre} {asegurado.apellido}</p>
            <p className="font-mono text-xs text-gray-400 dark:text-gray-500">{asegurado.dni}</p>
          </div>
        </div>
        
        {/* Póliza / Riesgo */}
        <div className="py-3 flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Póliza</span>
          <div className="text-right flex flex-col items-end">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-200">#{poliza.nroPoliza || "-"}</p>
            <span className="mt-1 font-mono text-[10px] uppercase bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 font-bold border border-gray-200/60 dark:border-gray-600">
              {poliza.patente || poliza.tipoPoliza}
            </span>
          </div>
        </div>

        {/* Descripción Breve */}
        <div className="py-3 flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Descripción del Hecho</span>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 italic leading-relaxed">
            "{siniestro.descripcionInicial}"
          </p>
        </div>

      </div>

      {/* 3. Pie: Estado y Botón de Expediente */}
      <div className="pl-5 pr-4 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
        {getStatusBadge(siniestro.estadoSiniestro)}
        
        <button
          onClick={() => router.push(`/siniestros/${siniestro.id}`)}
          className="inline-flex items-center justify-center bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-xl font-bold gap-1 text-xs transition-colors cursor-pointer active:scale-95 shadow-sm"
        >
          <Eye size={14} /> Expediente <ChevronRight size={14} className="-mr-1" />
        </button>
      </div>

    </div>
  );
}