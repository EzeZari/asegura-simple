"use client";

import { FileText, Trash2, Edit, Mail, ChevronRight } from "lucide-react";
import { ActionMenu, ActionMenuItem, ActionMenuDivider } from "@/components/ui/ActionMenu";

interface Props {
  poliza: any;
  onClickDetalle: (id: number) => void;
  menuAbiertoId: number | null;
  onToggleMenu: (id: number | null) => void;
  puedeModificar: boolean;
  onEdit?: (poliza: any) => void;
  onAvisarVencimiento?: (poliza: any) => void;
  onCambiarEstado?: (poliza: any, estado: string) => void;
  onEliminar?: (poliza: any) => void;
}

export default function PolizaMobileCard({
  poliza, onClickDetalle, menuAbiertoId, onToggleMenu,
  puedeModificar, onEdit, onAvisarVencimiento, onCambiarEstado, onEliminar
}: Props) {

  const getFechaLocal = (fechaStr: string) => {
    if (!fechaStr) return "-";
    const [año, mes, dia] = fechaStr.split('T')[0].split('-');
    const fecha = new Date(Number(año), Number(mes) - 1, Number(dia));
    return fecha.toLocaleDateString("es-AR");
  };

  const getEstadoInteligente = (p: any) => {
    if (p.estado === "Anulada" || p.estado === "Renovada") return p.estado;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    const [año, mes, dia] = p.fechaVencimiento.split('T')[0].split('-');
    const vencimiento = new Date(Number(año), Number(mes) - 1, Number(dia), 0, 0, 0, 0);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Vencida";
    if (diffDays <= 15) return "Próxima a Vencer"; 
    return p.estado; 
  };

  const estadoInteligente = getEstadoInteligente(poliza);

  // Colores del borde izquierdo según el estado
  const getBorderColor = (estado: string) => {
    switch (estado) {
      case "Vigente":
      case "Renovada": return "bg-emerald-500";
      case "Próxima a Vencer": return "bg-orange-500";
      case "Pendiente de Pago": return "bg-amber-500";
      case "Vencida": 
      case "Anulada": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Vigente":
      case "Renovada": return "bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
      case "Próxima a Vencer": return "bg-orange-100/50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
      case "Pendiente de Pago": return "bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
      case "Vencida": 
      case "Anulada": return "bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      default: return "bg-gray-100/50 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden transition-colors">
      
      {/* 🔥 Indicador lateral dinámico */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getBorderColor(estadoInteligente)}`}></div>

      {/* 1. Encabezado: Rama y Menú */}
      <div className="pl-5 pr-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/30">
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-gray-100 text-base">{poliza.tipoPoliza}</span>
          <span className="font-mono text-gray-500 dark:text-gray-400 text-xs">#{poliza.nroPoliza}</span>
        </div>
        
        {puedeModificar && (
          <div className="-mr-2 relative">
            <ActionMenu isOpen={menuAbiertoId === poliza.id} onToggle={() => onToggleMenu(menuAbiertoId === poliza.id ? null : poliza.id)}>
              <ActionMenuItem icon={Edit} label="Editar" onClick={() => { onEdit?.(poliza); onToggleMenu(null); }} />
              {poliza.asegurado?.email && estadoInteligente !== "Anulada" && (
                <ActionMenuItem icon={Mail} label="Avisar Vencimiento" onClick={() => onAvisarVencimiento?.(poliza)} />
              )}
              <ActionMenuDivider />
              <ActionMenuItem icon={Trash2} label="Anular" color="red" onClick={() => onCambiarEstado?.(poliza, "Anulada")} />
              <ActionMenuItem icon={Trash2} label="Eliminar" color="red" onClick={() => { onEliminar?.(poliza); onToggleMenu(null); }} />
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
            <p className="font-medium text-sm text-gray-900 dark:text-gray-200 truncate max-w-[160px]">{poliza.asegurado?.nombre} {poliza.asegurado?.apellido}</p>
            <p className="font-mono text-xs text-gray-400 dark:text-gray-500">{poliza.asegurado?.dni}</p>
          </div>
        </div>
        
        {/* Compañía y Cobertura */}
        <div className="py-3 flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Compañía</span>
          <div className="text-right">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-200 truncate max-w-[160px]">{poliza.compania?.nombre || "-"}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[160px]">{poliza.cobertura || "Sin detalle"}</p>
          </div>
        </div>

        {/* Dato Específico (Patente, Riesgo, etc) */}
        <div className="py-3 flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Detalle</span>
          {(() => {
            const rama = (poliza.tipoPoliza || "").toLowerCase();
            if (rama.includes("auto") || rama.includes("moto")) {
              return <span className="text-sm font-bold font-mono text-gray-900 dark:text-gray-200 tracking-wider bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{poliza.patente?.toUpperCase() || "-"}</span>;
            }
            if (rama.includes("combinado") || rama.includes("integral") || rama.includes("incendio") || rama.includes("robo")) {
              return <span className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate max-w-[150px]">{poliza.ubicacionRiesgo || "-"}</span>;
            }
            if (rama === "art") {
              return <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{poliza.cantidadEmpleados ? `${poliza.cantidadEmpleados} emp.` : "-"}</span>;
            }
            return <span className="text-sm font-medium text-gray-400 dark:text-gray-500 italic">N/A</span>;
          })()}
        </div>

        {/* Vencimiento */}
        <div className="py-3 flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Vencimiento</span>
          <span className="font-medium text-sm text-gray-900 dark:text-gray-200">{getFechaLocal(poliza.fechaVencimiento)}</span>
        </div>

      </div>

      {/* 3. Pie: Estado y Botón de Ver Detalles */}
      <div className="pl-5 pr-4 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getEstadoBadge(estadoInteligente)}`}>
          {estadoInteligente}
        </span>
        
        <button
          onClick={() => onClickDetalle(poliza.id)}
          className="inline-flex items-center justify-center bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-xl font-bold gap-1 text-xs transition-colors cursor-pointer active:scale-95 shadow-sm"
        >
          <FileText size={14} /> Ver póliza <ChevronRight size={14} className="-mr-1" />
        </button>
      </div>

    </div>
  );
}