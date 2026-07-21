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

  // 🔥 CORRECCIÓN ZONA HORARIA: Función auxiliar para parsear y renderizar la fecha localmente
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
    
    // 🔥 CORRECCIÓN ZONA HORARIA: Calculamos la diferencia exacta de días ignorando UTC
    const [año, mes, dia] = p.fechaVencimiento.split('T')[0].split('-');
    const vencimiento = new Date(Number(año), Number(mes) - 1, Number(dia), 0, 0, 0, 0);
    
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Vencida";
    if (diffDays <= 15) return "Próxima a Vencer"; 
    return p.estado; 
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Vigente":
      case "Renovada": return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Próxima a Vencer": return "bg-orange-100 text-orange-800 border border-orange-200";
      case "Pendiente de Pago": return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Vencida": 
      case "Anulada": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      <td className="px-4 lg:px-6 py-4 font-mono font-medium text-green-700 cursor-pointer hover:underline hover:text-green-800 whitespace-nowrap" onClick={() => onClickDetalle(poliza.id)}>
        #{poliza.nroPoliza}
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">{poliza.asegurado?.nombre} {poliza.asegurado?.apellido}</div>
        <div className="text-xs text-gray-500">DNI: {poliza.asegurado?.dni}</div>
      </td>
      <td className="px-4 lg:px-6 py-4 text-gray-700 whitespace-nowrap">{poliza.compania?.nombre || "-"}</td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">{poliza.tipoPoliza}</div>
        <div className="text-xs text-gray-500 truncate max-w-[150px]">{poliza.cobertura || "Sin detalle"}</div>
      </td>
      
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        {(() => {
          const rama = (poliza.tipoPoliza || "").toLowerCase();
          
          if (rama.includes("auto") || rama.includes("moto")) {
            return <div className="text-sm text-gray-900 font-medium">{poliza.patente?.toUpperCase() || "-"}</div>;
          }
          
          if (rama.includes("combinado") || rama.includes("integral") || rama.includes("incendio") || rama.includes("robo")) {
            return <div className="text-sm text-gray-900 truncate max-w-[150px]">{poliza.ubicacionRiesgo || "-"}</div>;
          }
          
          if (rama === "art") {
            return <div className="text-sm text-gray-900">{poliza.cantidadEmpleados ? `${poliza.cantidadEmpleados} empleados` : "-"}</div>;
          }

          return <div className="text-sm text-gray-400 italic">N/A</div>;
        })()}
      </td>

      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        {/* 🔥 CORRECCIÓN ZONA HORARIA APLICADA ACÁ */}
        <div className="text-gray-900 text-xs">{getFechaLocal(poliza.fechaInicio)}</div>
        <div className="text-xs font-bold text-gray-700">al {getFechaLocal(poliza.fechaVencimiento)}</div>
      </td>
      
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-700 font-medium">
          {poliza.formaPago || <span className="text-gray-400 italic text-xs">No definida</span>}
        </div>
      </td>

      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${getEstadoBadge(getEstadoInteligente(poliza))}`}>
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