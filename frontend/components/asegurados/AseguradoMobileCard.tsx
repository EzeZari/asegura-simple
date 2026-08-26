"use client";

import { Shield, Building2, User, Trash2, Edit } from "lucide-react";
import { ActionMenu, ActionMenuItem, ActionMenuDivider } from "@/components/ui/ActionMenu";

interface Props {
  cliente: any;
  onClickPolizas: (cliente: any) => void;
  menuAbiertoId: number | null;
  onToggleMenu: (id: number | null) => void;
  puedeModificar: boolean;
  onEdit?: (cliente: any) => void;
  onToggleEstado?: (cliente: any) => void;
  onEliminar?: (cliente: any) => void;
}

export default function AseguradoMobileCard({
  cliente, onClickPolizas, menuAbiertoId, onToggleMenu, puedeModificar, onEdit, onToggleEstado, onEliminar
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden transition-colors">
      
      {/* 🔥 Indicador lateral de estado (Tira de color en el borde izquierdo) */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${cliente.activo ? "bg-emerald-500" : "bg-red-500"}`}></div>

      {/* 1. Encabezado */}
      <div className="pl-5 pr-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/30">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base truncate pr-2">
          {cliente.nombre} {cliente.apellido}
        </h3>
        
        {puedeModificar && (
          <div className="-mr-2 relative">
            <ActionMenu isOpen={menuAbiertoId === cliente.id} onToggle={() => onToggleMenu(menuAbiertoId === cliente.id ? null : cliente.id)}>
              <ActionMenuItem icon={Edit} label="Editar" onClick={() => onEdit?.(cliente)} />
              <ActionMenuItem icon={cliente.activo ? Trash2 : Shield} label={cliente.activo ? "Desactivar" : "Activar"} color={cliente.activo ? "amber" : "green"} onClick={() => onToggleEstado?.(cliente)} />
              <ActionMenuDivider />
              <ActionMenuItem icon={Trash2} label="Eliminar" color="red" onClick={() => onEliminar?.(cliente)} />
            </ActionMenu>
          </div>
        )}
      </div>

      {/* 2. Cuerpo de la Tarjeta con divisorias internas (Estilo Ticket/Lista) */}
      <div className="pl-5 pr-4 flex flex-col divide-y divide-gray-100 dark:divide-gray-700/60">
        
        {/* Fila: DNI */}
        <div className="py-3 flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">DNI / CUIT</span>
          <span className="font-mono text-sm text-gray-900 dark:text-gray-200">{cliente.dni}</span>
        </div>
        
        {/* Fila: Contacto */}
        <div className="py-3 flex justify-between items-start">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Contacto</span>
          <div className="text-right">
             <p className="text-gray-900 dark:text-gray-200 text-sm font-medium">{cliente.telefono || "-"}</p>
             <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{cliente.email || "-"}</p>
          </div>
        </div>

        {/* Fila: Tipo */}
        <div className="py-3 flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tipo</span>
          <div className="flex items-center gap-1.5 text-gray-900 dark:text-gray-200 text-sm font-medium">
            {cliente.tipo === "Empresa" ? <Building2 size={14} className="text-blue-500" /> : <User size={14} className="text-gray-400" />}
            <span>{cliente.tipo}</span>
          </div>
        </div>
        
      </div>

      {/* 3. Pie de la Tarjeta */}
      <div className="pl-5 pr-4 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cliente.activo ? "bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
          {cliente.activo ? "Activo" : "Inactivo"}
        </span>
        
        <button
          onClick={() => onClickPolizas(cliente)}
          className="inline-flex items-center justify-center bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-xl font-bold gap-1.5 border border-green-200 dark:border-green-800/30 text-xs transition-colors cursor-pointer active:scale-95"
        >
          <Shield size={14} /> {cliente._count?.polizas || 0} Pólizas
        </button>
      </div>

    </div>
  );
}