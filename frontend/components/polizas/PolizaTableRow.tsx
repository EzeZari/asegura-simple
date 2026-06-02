import { FileText, Trash2, Edit, Mail } from "lucide-react";
import { ActionMenu, ActionMenuItem, ActionMenuDivider } from "@/components/ui/ActionMenu";

interface Props {
  poliza: any;
  onClickDetalle: (id: number) => void;
  menuAbiertoId: number | null;
  onToggleMenu: (id: number | null) => void;
  onEdit: (poliza: any) => void;
  onAvisarVencimiento: (poliza: any) => void;
  onCambiarEstado: (poliza: any, estado: string) => void;
  onEliminar: (poliza: any) => void;
}

export default function PolizaTableRow({
  poliza, onClickDetalle, menuAbiertoId, onToggleMenu,
  onEdit, onAvisarVencimiento, onCambiarEstado, onEliminar
}: Props) {

  const getEstadoInteligente = (p: any) => {
    if (p.estado === "Anulada" || p.estado === "Renovada") return p.estado;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    const vencimiento = new Date(p.fechaVencimiento);
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
      {/* 🔥 Usamos whitespace-nowrap para que los datos no se rompan en varios renglones */}
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
        {poliza.tipoPoliza === "Automotor" || poliza.tipoPoliza === "Motovehículo" ? (
          <div className="text-sm text-gray-900">{poliza.patente?.toUpperCase() || "-"}</div>
        ) : (
          <div className="text-sm text-gray-900 truncate max-w-[150px]">{poliza.ubicacionRiesgo || "-"}</div>
        )}
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <div className="text-gray-900 text-xs">{new Date(poliza.fechaInicio).toLocaleDateString("es-AR")}</div>
        <div className="text-xs font-bold text-gray-700">al {new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR")}</div>
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${getEstadoBadge(getEstadoInteligente(poliza))}`}>
          {getEstadoInteligente(poliza)}
        </span>
      </td>
      <td className="px-4 lg:px-6 py-4 text-right relative whitespace-nowrap">
        <ActionMenu isOpen={menuAbiertoId === poliza.id} onToggle={() => onToggleMenu(menuAbiertoId === poliza.id ? null : poliza.id)}>
          <ActionMenuItem icon={Edit} label="Editar" onClick={() => { onEdit(poliza); onToggleMenu(null); }} />
          {poliza.asegurado?.email && getEstadoInteligente(poliza) !== "Anulada" && (
            <ActionMenuItem icon={Mail} label="Avisar Vencimiento" onClick={() => onAvisarVencimiento(poliza)} />
          )}
          <ActionMenuDivider />
          <ActionMenuItem icon={Trash2} label="Anular" color="red" onClick={() => onCambiarEstado(poliza, "Anulada")} />
          <ActionMenuItem icon={Trash2} label="Eliminar" color="red" onClick={() => { onEliminar(poliza); onToggleMenu(null); }} />
        </ActionMenu>
      </td>
    </tr>
  );
}