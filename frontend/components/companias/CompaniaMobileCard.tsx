"use client";

import { Edit, Trash2, Building2 } from "lucide-react";
import { ActionMenu, ActionMenuItem } from "@/components/ui/ActionMenu";

interface Props {
  compania: any;
  menuAbiertoId: number | null;
  onToggleMenu: (id: number | null) => void;
  puedeModificar: boolean;
  onEdit: (compania: any) => void;
  onEliminar: (compania: any) => void;
}

export default function CompaniaMobileCard({
  compania, menuAbiertoId, onToggleMenu, puedeModificar, onEdit, onEliminar
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden transition-colors">
      
      {/* 🔥 Indicador lateral (Azul para compañías) */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 dark:bg-blue-600"></div>

      {/* 1. Encabezado */}
      <div className="pl-5 pr-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/30">
        <div className="flex items-center gap-2 overflow-hidden pr-2">
          <Building2 size={16} className="text-blue-500 dark:text-blue-400 shrink-0" />
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base truncate">
            {compania.nombre}
          </h3>
        </div>
        
        {puedeModificar && (
          <div className="-mr-2 relative shrink-0">
            <ActionMenu isOpen={menuAbiertoId === compania.id} onToggle={() => onToggleMenu(menuAbiertoId === compania.id ? null : compania.id)}>
              <ActionMenuItem icon={Edit} label="Editar" onClick={() => onEdit(compania)} />
              <ActionMenuItem icon={Trash2} label="Eliminar" color="red" onClick={() => onEliminar(compania)} />
            </ActionMenu>
          </div>
        )}
      </div>

      {/* 2. Cuerpo de la Tarjeta con divisorias internas */}
      <div className="pl-5 pr-4 flex flex-col divide-y divide-gray-100 dark:divide-gray-700/60">
        
        {/* Fila: CUIT */}
        <div className="py-3 flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">CUIT</span>
          <span className="font-mono text-sm text-gray-900 dark:text-gray-200">{compania.cuit || "-"}</span>
        </div>
        
        {/* Fila: Teléfono Siniestros */}
        <div className="py-3 flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tel. Siniestros</span>
          <span className="font-medium text-sm text-gray-900 dark:text-gray-200">{compania.telefonoSiniestros || "-"}</span>
        </div>

        {/* Fila: Email */}
        <div className="py-3 flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email</span>
          <span className="font-medium text-sm text-gray-900 dark:text-gray-200 truncate ml-4">{compania.email || "-"}</span>
        </div>
        
      </div>

    </div>
  );
}