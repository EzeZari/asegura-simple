import { Shield, Building2, User, Trash2, Edit } from "lucide-react";
import { ActionMenu, ActionMenuItem, ActionMenuDivider } from "@/components/ui/ActionMenu";

interface Props {
  cliente: any;
  onClickPolizas: (cliente: any) => void;
  menuAbiertoId: number | null;
  onToggleMenu: (id: number | null) => void;
  onEdit: (cliente: any) => void;
  onToggleEstado: (cliente: any) => void;
  onEliminar: (cliente: any) => void;
}

export default function AseguradoTableRow({ cliente, onClickPolizas, menuAbiertoId, onToggleMenu, onEdit, onToggleEstado, onEliminar }: Props) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      {/* 🔥 AJUSTE: whitespace-nowrap en todas las celdas */}
      <td className="px-4 lg:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{cliente.nombre} {cliente.apellido}</td>
      <td className="px-4 lg:px-6 py-4 text-gray-600 font-mono text-xs whitespace-nowrap">{cliente.dni}</td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-gray-900">{cliente.telefono || "-"}</span>
          <span className="text-gray-400 text-xs">{cliente.email || "-"}</span>
        </div>
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-gray-600">
          {cliente.tipo === "Empresa" ? <Building2 size={16} className="text-blue-500" /> : <User size={16} className="text-gray-400" />}
          <span>{cliente.tipo}</span>
        </div>
      </td>
      <td className="px-4 lg:px-6 py-4 text-gray-500 italic whitespace-nowrap">{new Date(cliente.fechaRegistro).toLocaleDateString("es-AR")}</td>
      <td className="px-4 lg:px-6 py-4 text-center whitespace-nowrap">
        <button
          onClick={() => onClickPolizas(cliente)}
          className="inline-flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold gap-1.5 border border-green-100 hover:border-green-200 text-xs transition-colors cursor-pointer"
        >
          <Shield size={14} /> {cliente._count?.polizas || 0}
        </button>
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cliente.activo ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
          {cliente.activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="px-4 lg:px-6 py-4 text-right relative whitespace-nowrap">
        <ActionMenu isOpen={menuAbiertoId === cliente.id} onToggle={() => onToggleMenu(menuAbiertoId === cliente.id ? null : cliente.id)}>
          <ActionMenuItem icon={Edit} label="Editar" onClick={() => onEdit(cliente)} />
          <ActionMenuItem
            icon={cliente.activo ? Trash2 : Shield}
            label={cliente.activo ? "Desactivar" : "Activar"}
            color={cliente.activo ? "amber" : "green"}
            onClick={() => onToggleEstado(cliente)}
          />
          <ActionMenuDivider />
          <ActionMenuItem
            icon={Trash2} label="Eliminar" color="red"
            onClick={() => onEliminar(cliente)}
          />
        </ActionMenu>
      </td>
    </tr>
  );
}