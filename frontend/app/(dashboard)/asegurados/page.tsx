"use client";

import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, Shield, Building2, User, Search, Trash2, Edit } from "lucide-react";
import NuevoAseguradoModal from "@/components/asegurados/NuevoAseguradoModal";
import AseguradosFiltros from "@/components/asegurados/AseguradosFiltros";
import Toast from "@/components/ui/Toast";
import Table, { TableColumn } from "@/components/ui/Table";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PolizasDelAseguradoModal from "@/components/asegurados/PolizasDelAseguradoModal";
import { useTableSort } from "@/app/hooks/useTableSort";
import SortableHeader from "@/components/ui/SortableHeader";

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
      const data = await res.json();
      setAsegurados(data);
    } catch (error) {
      console.error("Error al cargar asegurados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAsegurados(); }, []);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setClienteAEditar(null);
    fetchAsegurados();
    setMensajeToast("Asegurado guardado correctamente");
    setShowToast(true);
  };

  const abrirParaEditar = (cliente: any) => {
    setClienteAEditar(cliente);
    setMenuAbiertoId(null);
    setIsModalOpen(true);
  };

  const toggleEstado = async (cliente: any) => {
    try {
      await fetch(`http://localhost:3001/api/asegurados/${cliente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cliente, activo: !cliente.activo }),
      });
      fetchAsegurados();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    } finally {
      setMenuAbiertoId(null);
    }
  };

  const ejecutarEliminacion = async () => {
    if (!aseguradoAEliminar) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:3001/api/asegurados/${aseguradoAEliminar.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchAsegurados();
      setMensajeToast("Asegurado eliminado correctamente");
      setShowToast(true);
      setIsConfirmOpen(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
      setAseguradoAEliminar(null);
    }
  };

  // 1. PRIMERO FILTRAMOS LOS DATOS
  const aseguradosFiltrados = asegurados.filter((cliente) => {
    const busqueda = searchTerm.toLowerCase();
    const nombreCompleto = `${cliente.nombre} ${cliente.apellido || ""}`.toLowerCase();
    const pasaFiltroTexto = nombreCompleto.includes(busqueda) || cliente.dni.includes(busqueda);
    const pasaFiltroTipo = filtroTipo === "Todos" || cliente.tipo === filtroTipo;
    const pasaFiltroEstado = 
      filtroEstado === "Todos" || 
      (filtroEstado === "Activos" && cliente.activo) || 
      (filtroEstado === "Inactivos" && !cliente.activo);

    return pasaFiltroTexto && pasaFiltroTipo && pasaFiltroEstado;
  });

  // 2. DESPUÉS ORDENAMOS LOS DATOS FILTRADOS
  const { items: aseguradosOrdenados, requestSort, sortConfig } = useTableSort(aseguradosFiltrados);

  // 3. ARMAMOS LAS COLUMNAS CON LOS BOTONES DE ORDENAMIENTO
  const columnas: TableColumn[] = [
    { label: <SortableHeader label="Nombre / Razón Social" sortKey="nombre" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: <SortableHeader label="DNI / CUIT" sortKey="dni" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: "Contacto" }, // Esta columna no se ordena porque son múltiples datos combinados
    { label: <SortableHeader label="Tipo" sortKey="tipo" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: <SortableHeader label="Fecha de Alta" sortKey="fechaRegistro" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: "Pólizas", align: "center" },
    { label: <SortableHeader label="Estado" sortKey="activo" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: "Acciones", align: "right" },
  ];

  const estadoVacio = (
    <div className="flex flex-col items-center justify-center text-gray-500">
      <Search size={32} className="text-gray-300 mb-3" />
      <p className="font-medium text-gray-900">No se encontraron clientes</p>
      <p className="text-sm mt-1">Probá ajustando los filtros de búsqueda.</p>
    </div>
  );

  return (
    <div className="flex flex-col p-8 w-full gap-8 bg-white min-h-screen overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Asegurados</h1>
          <p className="text-gray-500 mt-1">Gestioná tu cartera de clientes reales.</p>
        </div>
        <button 
          onClick={() => { setClienteAEditar(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={20} /> Nuevo Asegurado
        </button>
      </div>

      <AseguradosFiltros 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        filtroTipo={filtroTipo} setFiltroTipo={setFiltroTipo}
        filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado}
      />

      <Table 
        columns={columnas} 
        isLoading={isLoading} 
        isEmpty={aseguradosOrdenados.length === 0} 
        emptyContent={estadoVacio}
      >
        {/* IMPORTANTE: Ahora mapeamos sobre 'aseguradosOrdenados' en vez de 'aseguradosFiltrados' */}
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
            <td className="px-6 py-4 text-gray-500 italic">
              {new Date(cliente.fechaRegistro).toLocaleDateString("es-AR")}
            </td>
            <td className="px-6 py-4 text-center">
              <button 
                onClick={() => setAseguradoParaVerPolizas(cliente)}
                className="inline-flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold gap-1.5 border border-green-100 hover:border-green-200 text-xs transition-colors cursor-pointer"
                title="Ver pólizas"
              >
                <Shield size={14} /> {cliente._count?.polizas || 0}
              </button>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                cliente.activo ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              }`}>
                {cliente.activo ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td className="px-6 py-4 text-right relative">
              <button 
                onClick={() => setMenuAbiertoId(menuAbiertoId === cliente.id ? null : cliente.id)}
                className="text-gray-400 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-lg"
              >
                <MoreHorizontal size={20} />
              </button>
              {menuAbiertoId === cliente.id && (
                <div className="absolute right-8 top-10 mt-1 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                  <button 
                    onClick={() => abrirParaEditar(cliente)} 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit size={14} /> Editar
                  </button>
                  <button 
                    onClick={() => toggleEstado(cliente)} 
                    className={`w-full text-left px-4 py-2 text-sm ${cliente.activo ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                  >
                    {cliente.activo ? "Desactivar" : "Activar"}
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button 
                    onClick={() => {
                      setAseguradoAEliminar(cliente);
                      setMenuAbiertoId(null);
                      setIsConfirmOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <NuevoAseguradoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} clienteAEditar={clienteAEditar} />
      
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={ejecutarEliminacion}
        isLoading={isDeleting}
        title="¿Eliminar asegurado?"
        message={`Esta acción eliminará a "${aseguradoAEliminar?.nombre} ${aseguradoAEliminar?.apellido || ''}" permanentemente. Solo es posible si no tiene pólizas activas.`}
      />
      
      <PolizasDelAseguradoModal 
        isOpen={!!aseguradoParaVerPolizas} 
        onClose={() => setAseguradoParaVerPolizas(null)} 
        asegurado={aseguradoParaVerPolizas} 
      />

      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}