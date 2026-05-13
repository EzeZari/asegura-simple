"use client";

import { useState, useEffect } from "react";
import { Shield, Building2, User, Trash2, Edit, Search } from "lucide-react";
import NuevoAseguradoModal from "@/components/asegurados/NuevoAseguradoModal";
import AseguradosFiltros from "@/components/asegurados/AseguradosFiltros";
import Toast from "@/components/ui/Toast";
import Table, { TableColumn } from "@/components/ui/Table";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PolizasDelAseguradoModal from "@/components/asegurados/PolizasDelAseguradoModal";
import { useTableSort } from "@/hooks/useTableSort";
import SortableHeader from "@/components/ui/SortableHeader";
// PIEZAS DE LEGO
import PageHeader from "@/components/ui/PageHeader";
import SearchBar from "@/components/ui/SearchBar";
import { ActionMenu, ActionMenuItem, ActionMenuDivider } from "@/components/ui/ActionMenu";

export default function AseguradosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteAEditar, setClienteAEditar] = useState<any>(null);
  const [asegurados, setAsegurados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [aseguradoAEliminar, setAseguradoAEliminar] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  const [aseguradoParaVerPolizas, setAseguradoParaVerPolizas] = useState<any>(null);

  const fetchAsegurados = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/asegurados");
      setAsegurados(await res.json());
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAsegurados(); }, []);

  const toggleEstado = async (cliente: any) => {
    try {
      await fetch(`http://localhost:3001/api/asegurados/${cliente.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cliente, activo: !cliente.activo }),
      });
      fetchAsegurados();
    } catch (error) { console.error(error); } finally { setMenuAbiertoId(null); }
  };

  const ejecutarEliminacion = async () => {
    if (!aseguradoAEliminar) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:3001/api/asegurados/${aseguradoAEliminar.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      fetchAsegurados();
      setMensajeToast("Asegurado eliminado correctamente");
      setShowToast(true);
      setIsConfirmOpen(false);
    } catch (error: any) { alert(error.message); } finally { setIsDeleting(false); setAseguradoAEliminar(null); }
  };

  const aseguradosFiltrados = asegurados.filter((cliente) => {
    const busqueda = searchTerm.toLowerCase();
    const nombreCompleto = `${cliente.nombre} ${cliente.apellido || ""}`.toLowerCase();
    const pasaFiltroTexto = nombreCompleto.includes(busqueda) || cliente.dni.includes(busqueda);
    const pasaFiltroTipo = filtroTipo === "Todos" || cliente.tipo === filtroTipo;
    const pasaFiltroEstado = filtroEstado === "Todos" || (filtroEstado === "Activos" && cliente.activo) || (filtroEstado === "Inactivos" && !cliente.activo);
    return pasaFiltroTexto && pasaFiltroTipo && pasaFiltroEstado;
  });

  const { items: aseguradosOrdenados, requestSort, sortConfig } = useTableSort(aseguradosFiltrados);

  const columnas: TableColumn[] = [
    { label: <SortableHeader label="Nombre / Razón Social" sortKey="nombre" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: <SortableHeader label="DNI / CUIT" sortKey="dni" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: "Contacto" },
    { label: <SortableHeader label="Tipo" sortKey="tipo" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: <SortableHeader label="Fecha de Alta" sortKey="fechaRegistro" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: "Pólizas", align: "center" },
    { label: <SortableHeader label="Estado" sortKey="activo" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: "Acciones", align: "right" },
  ];

  return (
    <div className="flex flex-col p-8 w-full gap-8 bg-white min-h-screen overflow-x-hidden">
      
      <PageHeader 
        titulo="Asegurados" 
        descripcion="Gestioná tu cartera de clientes reales." 
        textoBoton="Nuevo Asegurado" 
        onNuevo={() => { setClienteAEditar(null); setIsModalOpen(true); }} 
      />

      <AseguradosFiltros 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        filtroTipo={filtroTipo} setFiltroTipo={setFiltroTipo}
        filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado}
      />

      <Table columns={columnas} isLoading={isLoading} isEmpty={aseguradosOrdenados.length === 0} emptyContent={<div className="flex flex-col items-center justify-center text-gray-500 py-6"><Search size={32} className="text-gray-300 mb-3" /><p className="font-medium text-gray-900">No se encontraron clientes</p></div>}>
        {aseguradosOrdenados.map((cliente) => (
          <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors group">
            <td className="px-6 py-4 font-medium text-gray-900">{cliente.nombre} {cliente.apellido}</td>
            <td className="px-6 py-4 text-gray-600 font-mono text-xs">{cliente.dni}</td>
            <td className="px-6 py-4">
              <div className="flex flex-col">
                <span className="text-gray-900">{cliente.telefono || "-"}</span>
                <span className="text-gray-400 text-xs">{cliente.email || "-"}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1.5 text-gray-600">
                {cliente.tipo === "Empresa" ? <Building2 size={16} className="text-blue-500"/> : <User size={16} className="text-gray-400"/>}
                <span>{cliente.tipo}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-gray-500 italic">{new Date(cliente.fechaRegistro).toLocaleDateString("es-AR")}</td>
            <td className="px-6 py-4 text-center">
              <button 
                onClick={() => setAseguradoParaVerPolizas(cliente)} 
                className="inline-flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold gap-1.5 border border-green-100 hover:border-green-200 text-xs transition-colors cursor-pointer"
              >
                <Shield size={14} /> {cliente._count?.polizas || 0}
              </button>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cliente.activo ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                {cliente.activo ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td className="px-6 py-4 text-right relative">
              <ActionMenu isOpen={menuAbiertoId === cliente.id} onToggle={() => setMenuAbiertoId(menuAbiertoId === cliente.id ? null : cliente.id)}>
                <ActionMenuItem icon={Edit} label="Editar" onClick={() => { setClienteAEditar(cliente); setMenuAbiertoId(null); setIsModalOpen(true); }} />
                <ActionMenuItem 
                  icon={cliente.activo ? Trash2 : Shield} 
                  label={cliente.activo ? "Desactivar" : "Activar"} 
                  color={cliente.activo ? "amber" : "green"} 
                  onClick={() => toggleEstado(cliente)} 
                />
                <ActionMenuDivider />
                <ActionMenuItem 
                  icon={Trash2} label="Eliminar" color="red" 
                  onClick={() => { setAseguradoAEliminar(cliente); setMenuAbiertoId(null); setIsConfirmOpen(true); }} 
                />
              </ActionMenu>
            </td>
          </tr>
        ))}
      </Table>

      <NuevoAseguradoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchAsegurados(); setShowToast(true); setMensajeToast("Asegurado guardado correctamente"); }} clienteAEditar={clienteAEditar} />
      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={ejecutarEliminacion} isLoading={isDeleting} title="¿Eliminar asegurado?" message={`Esta acción eliminará a "${aseguradoAEliminar?.nombre} ${aseguradoAEliminar?.apellido || ''}" permanentemente. Solo es posible si no tiene pólizas activas.`} />
      <PolizasDelAseguradoModal isOpen={!!aseguradoParaVerPolizas} onClose={() => setAseguradoParaVerPolizas(null)} asegurado={aseguradoParaVerPolizas} />
      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}