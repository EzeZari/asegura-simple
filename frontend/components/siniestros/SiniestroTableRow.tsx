"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, Clock, CheckCircle, Edit, Trash2, Eye } from "lucide-react";
import { ActionMenu, ActionMenuItem, ActionMenuDivider } from "@/components/ui/ActionMenu";

interface Props {
  siniestro: any;
  menuAbiertoId: number | null;
  onToggleMenu: (id: number | null) => void;
  onEdit: (siniestro: any) => void;
  onEliminar: (siniestro: any) => void;
}

export default function SiniestroTableRow({ siniestro, menuAbiertoId, onToggleMenu, onEdit, onEliminar }: Props) {
  const router = useRouter();

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Denuncia Pendiente": return <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Pendiente</span>;
      case "En Análisis": return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={12}/> En Análisis</span>;
      case "Aprobado": return <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Aprobado</span>;
      case "Pagado": return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Pagado</span>;
      case "Rechazado": return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-bold w-fit">Rechazado</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-bold w-fit">{estado}</span>;
    }
  };

  const poliza = siniestro.poliza || {};
  const asegurado = poliza.asegurado || {};

  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      <td className="px-6 py-4">
        {/* 🔥 MEJORA DE UX: El número ahora es un enlace rápido clickeable directo */}
        <button 
          onClick={() => router.push(`/siniestros/${siniestro.id}`)}
          className="font-bold text-orange-600 hover:text-orange-700 hover:underline text-left outline-none block"
        >
          {siniestro.nroSiniestro}
        </button>
        <p className="text-xs text-gray-400 mt-0.5">{new Date(siniestro.fechaHecho).toLocaleDateString("es-AR")}</p>
      </td>
      <td className="px-6 py-4">
        <p className="font-medium text-gray-900">{asegurado.nombre} {asegurado.apellido}</p>
        <p className="text-xs text-gray-500 font-mono">DNI: {asegurado.dni}</p>
      </td>
      
      {/* Columna separada para Nro Póliza */}
      <td className="px-6 py-4 text-sm font-semibold text-gray-700">
        #{poliza.nroPoliza || "-"}
      </td>
      
      {/* Columna separada para Patente */}
      <td className="px-6 py-4">
        <span className="font-mono text-xs uppercase bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600 font-bold border border-gray-200/60">
          {poliza.patente || poliza.tipoPoliza}
        </span>
      </td>
      
      <td className="px-6 py-4 max-w-[180px] truncate text-sm text-gray-600" title={siniestro.descripcionInicial}>
        {siniestro.descripcionInicial}
      </td>
      <td className="px-6 py-4">
        {getStatusBadge(siniestro.estadoSiniestro)}
      </td>
      <td className="px-6 py-4 text-right relative">
        <ActionMenu isOpen={menuAbiertoId === siniestro.id} onToggle={() => onToggleMenu(menuAbiertoId === siniestro.id ? null : siniestro.id)}>
          <ActionMenuItem icon={Eye} label="Ver Expediente" onClick={() => router.push(`/siniestros/${siniestro.id}`)} />
          <ActionMenuItem icon={Edit} label="Editar Datos" onClick={() => onEdit(siniestro)} />
          <ActionMenuDivider />
          <ActionMenuItem icon={Trash2} label="Eliminar" color="red" onClick={() => onEliminar(siniestro)} />
        </ActionMenu>
      </td>
    </tr>
  );
}