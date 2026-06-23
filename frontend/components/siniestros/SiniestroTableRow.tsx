"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, Clock, CheckCircle, Edit, Trash2, Eye } from "lucide-react";
import { ActionMenu, ActionMenuItem, ActionMenuDivider } from "@/components/ui/ActionMenu";

interface Props {
  siniestro: any;
  menuAbiertoId: number | null;
  onToggleMenu: (id: number | null) => void;
  
  // 🔥 RECIBIMOS LA ORDEN DESDE EL PADRE
  puedeModificar: boolean;

  // 🔥 LAS HACEMOS OPCIONALES
  onEdit?: (siniestro: any) => void;
  onEliminar?: (siniestro: any) => void;
}

export default function SiniestroTableRow({ 
  siniestro, 
  menuAbiertoId, 
  onToggleMenu, 
  puedeModificar, // La extraemos acá
  onEdit, 
  onEliminar 
}: Props) {
  const router = useRouter();

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Denuncia Pendiente": return <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit whitespace-nowrap"><Clock size={10}/> Pendiente</span>;
      case "En Análisis": return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit whitespace-nowrap"><AlertCircle size={10}/> En Análisis</span>;
      case "Aprobado": return <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit whitespace-nowrap"><CheckCircle size={10}/> Aprobado</span>;
      case "Pagado": return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit whitespace-nowrap"><CheckCircle size={10}/> Pagado</span>;
      case "Rechazado": return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit whitespace-nowrap">Rechazado</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit whitespace-nowrap">{estado}</span>;
    }
  };

  const poliza = siniestro.poliza || {};
  const asegurado = poliza.asegurado || {};

  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      {/* 🔥 AJUSTE: whitespace-nowrap en todas las celdas */}
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <button 
          onClick={() => router.push(`/siniestros/${siniestro.id}`)}
          className="font-bold text-orange-600 hover:text-orange-700 hover:underline text-left outline-none block text-sm"
        >
          {siniestro.nroSiniestro}
        </button>
        <p className="text-[10px] lg:text-xs text-gray-400 mt-0.5">{new Date(siniestro.fechaHecho).toLocaleDateString("es-AR")}</p>
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <p className="font-medium text-gray-900 text-sm">{asegurado.nombre} {asegurado.apellido}</p>
        <p className="text-[10px] lg:text-xs text-gray-500 font-mono">DNI: {asegurado.dni}</p>
      </td>
      
      <td className="px-4 lg:px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">
        #{poliza.nroPoliza || "-"}
      </td>
      
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <span className="font-mono text-[10px] lg:text-xs uppercase bg-gray-100 px-2 py-1 rounded-lg text-gray-600 font-bold border border-gray-200/60">
          {poliza.patente || poliza.tipoPoliza}
        </span>
      </td>
      
      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 truncate max-w-[150px] lg:max-w-[200px]" title={siniestro.descripcionInicial}>
        {siniestro.descripcionInicial}
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        {getStatusBadge(siniestro.estadoSiniestro)}
      </td>
      
      {/* 🔥 EL ESCUDO: Todo este 'td' desaparece si el usuario es Solo Lectura */}
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