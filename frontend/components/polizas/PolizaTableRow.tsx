"use client";

import { FileText, Trash2, Edit, Mail } from "lucide-react";
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

export default function PolizaTableRow({
  poliza, onClickDetalle, menuAbiertoId, onToggleMenu,
  puedeModificar,
  onEdit, onAvisarVencimiento, onCambiarEstado, onEliminar
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

  // 🔥 Badges adaptados
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Vigente":
      case "Renovada": return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30";
      case "Próxima a Vencer": return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-800/30";
      case "Pendiente de Pago": return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30";
      case "Vencida": 
      case "Anulada": return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/30";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    }
  };

  return (
    // 🔥 Hover de la fila adaptado
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
      <td className="px-4 lg:px-6 py-4 font-mono font-medium text-green-700 dark:text-green-500 cursor-pointer hover:underline hover:text-green-800 dark:hover:text-green-400 whitespace-nowrap transition-colors" onClick={() => onClickDetalle(poliza.id)}>
        #{poliza.nroPoliza}
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900 dark:text-gray-100 transition-colors">{poliza.asegurado?.nombre} {poliza.asegurado?.apellido}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">DNI: {poliza.asegurado?.dni}</div>
      </td>
      <td className="px-4 lg:px-6 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap transition-colors">{poliza.compania?.nombre || "-"}</td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900 dark:text-gray-100 transition-colors">{poliza.tipoPoliza}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] transition-colors">{poliza.cobertura || "Sin detalle"}</div>
      </td>
      
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap transition-colors">
        {(() => {
          const rama = (poliza.tipoPoliza || "").toLowerCase();
          
          if (rama.includes("auto") || rama.includes("moto")) {
            return <div className="text-sm text-gray-900 dark:text-gray-300 font-medium">{poliza.patente?.toUpperCase() || "-"}</div>;
          }
          
          if (rama.includes("combinado") || rama.includes("integral") || rama.includes("incendio") || rama.includes("robo")) {
            return <div className="text-sm text-gray-900 dark:text-gray-300 truncate max-w-[150px]">{poliza.ubicacionRiesgo || "-"}</div>;
          }
          
          if (rama === "art") {
            return <div className="text-sm text-gray-900 dark:text-gray-300">{poliza.cantidadEmpleados ? `${poliza.cantidadEmpleados} empleados` : "-"}</div>;
          }

          return <div className="text-sm text-gray-400 dark:text-gray-500 italic">N/A</div>;
        })()}
      </td>

      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <div className="text-gray-900 dark:text-gray-300 text-xs transition-colors">{getFechaLocal(poliza.fechaInicio)}</div>
        <div className="text-xs font-bold text-gray-700 dark:text-gray-400 transition-colors">al {getFechaLocal(poliza.fechaVencimiento)}</div>
      </td>
      
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-700 dark:text-gray-300 font-medium transition-colors">
          {poliza.formaPago || <span className="text-gray-400 dark:text-gray-500 italic text-xs">No definida</span>}
        </div>
      </td>

      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition-colors ${getEstadoBadge(getEstadoInteligente(poliza))}`}>
          {getEstadoInteligente(poliza)}
        </span>
      </td>
      
      {puedeModificar && (
        <td className="px-4 lg:px-6 py-4 text-right relative whitespace-nowrap">
          <ActionMenu isOpen={menuAbiertoId === poliza.id} onToggle={() => onToggleMenu(menuAbiertoId === poliza.id ? null : poliza.id)}>
            <ActionMenuItem icon={Edit} label="Editar" onClick={() => { onEdit?.(poliza); onToggleMenu(null); }} />
            {poliza.asegurado?.email && getEstadoInteligente(poliza) !== "Anulada" && (
              <ActionMenuItem icon={Mail} label="Avisar Vencimiento" onClick={() => onAvisarVencimiento?.(poliza)} />
            )}
            <ActionMenuDivider />
            <ActionMenuItem icon={Trash2} label="Anular" color="red" onClick={() => onCambiarEstado?.(poliza, "Anulada")} />
            <ActionMenuItem icon={Trash2} label="Eliminar" color="red" onClick={() => { onEliminar?.(poliza); onToggleMenu(null); }} />
          </ActionMenu>
        </td>
      )}
    </tr>
  );
}