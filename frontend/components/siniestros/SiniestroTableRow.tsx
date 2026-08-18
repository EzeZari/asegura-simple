"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, Clock, CheckCircle, Edit, Trash2, Eye } from "lucide-react";
import { ActionMenu, ActionMenuItem, ActionMenuDivider } from "@/components/ui/ActionMenu";

interface Props {
  siniestro: any;
  menuAbiertoId: number | null;
  onToggleMenu: (id: number | null) => void;
  puedeModificar: boolean;
  onEdit?: (siniestro: any) => void;
  onEliminar?: (siniestro: any) => void;
}

export default function SiniestroTableRow({ 
  siniestro, menuAbiertoId, onToggleMenu, puedeModificar, onEdit, onEliminar 
}: Props) {
  const router = useRouter();

  // 🔥 Badges adaptados
  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Denuncia Pendiente": return <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border border-transparent dark:border-orange-800/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit whitespace-nowrap"><Clock size={10}/> Pendiente</span>;
      case "En Análisis": return <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-transparent dark:border-blue-800/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit whitespace-nowrap"><AlertCircle size={10}/> En Análisis</span>;
      case "Aprobado": return <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-transparent dark:border-green-800/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit whitespace-nowrap"><CheckCircle size={10}/> Aprobado</span>;
      case "Pagado": return <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-transparent dark:border-emerald-800/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit whitespace-nowrap"><CheckCircle size={10}/> Pagado</span>;
      case "Rechazado": return <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-transparent dark:border-red-800/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit whitespace-nowrap">Rechazado</span>;
      default: return <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-transparent dark:border-gray-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit whitespace-nowrap">{estado}</span>;
    }
  };

  const poliza = siniestro.poliza || {};
  const asegurado = poliza.asegurado || {};

  return (
    <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <button 
          onClick={() => router.push(`/siniestros/${siniestro.id}`)}
          className="font-bold text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 hover:underline text-left outline-none block text-sm transition-colors"
        >
          {siniestro.nroSiniestro}
        </button>
        <p className="text-[10px] lg:text-xs text-gray-400 dark:text-gray-500 mt-0.5 transition-colors">{new Date(siniestro.fechaHecho).toLocaleDateString("es-AR")}</p>
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm transition-colors">{asegurado.nombre} {asegurado.apellido}</p>
        <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 font-mono transition-colors">DNI: {asegurado.dni}</p>
      </td>
      
      <td className="px-4 lg:px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap transition-colors">
        #{poliza.nroPoliza || "-"}
      </td>
      
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <span className="font-mono text-[10px] lg:text-xs uppercase bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-300 font-bold border border-gray-200/60 dark:border-gray-700 transition-colors">
          {poliza.patente || poliza.tipoPoliza}
        </span>
      </td>
      
      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px] lg:max-w-[200px] transition-colors" title={siniestro.descripcionInicial}>
        {siniestro.descripcionInicial}
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap transition-colors">
        {getStatusBadge(siniestro.estadoSiniestro)}
      </td>
      
      {puedeModificar && (
        <td className="px-4 lg:px-6 py-4 text-right relative whitespace-nowrap">
          <ActionMenu isOpen={menuAbiertoId === siniestro.id} onToggle={() => onToggleMenu(menuAbiertoId === siniestro.id ? null : siniestro.id)}>
            <ActionMenuItem icon={Eye} label="Ver Expediente" onClick={() => router.push(`/siniestros/${siniestro.id}`)} />
            <ActionMenuItem icon={Edit} label="Editar Datos" onClick={() => onEdit?.(siniestro)} />
            <ActionMenuDivider />
            <ActionMenuItem icon={Trash2} label="Eliminar" color="red" onClick={() => onEliminar?.(siniestro)} />
          </ActionMenu>
        </td>
      )}
    </tr>
  );
}