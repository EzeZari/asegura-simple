"use client";

import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, Shield, Building2, User, Search } from "lucide-react";
import NuevoAseguradoModal from "@/components/asegurados/NuevoAseguradoModal";
import AseguradosFiltros from "@/components/asegurados/AseguradosFiltros";
import Toast from "@/components/ui/Toast";
import Table, { TableColumn } from "@/components/ui/Table";

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

  // DEFINIMOS LAS COLUMNAS DE ESTA TABLA
  const columnas: TableColumn[] = [
    { label: "Nombre / Razón Social" },
    { label: "DNI / CUIT" },
    { label: "Contacto" },
    { label: "Tipo" },
    { label: "Fecha de Alta" },
    { label: "Pólizas", align: "center" },
    { label: "Estado" },
    { label: "Acciones", align: "right" },
  ];

  // DEFINIMOS EL DISEÑO VACÍO
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

      {/* USAMOS EL NUEVO COMPONENTE MAESTRO */}
      <Table 
        columns={columnas} 
        isLoading={isLoading} 
        isEmpty={aseguradosFiltrados.length === 0} 
        emptyContent={estadoVacio}
      >
        {aseguradosFiltrados.map((cliente) => (
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
              <div className="inline-flex items-center justify-center bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold gap-1.5 border border-green-100 text-xs">
                <Shield size={14} /> 0
              </div>
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
                <div className="absolute right-8 top-10 mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <button onClick={() => abrirParaEditar(cliente)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Editar</button>
                  <button onClick={() => toggleEstado(cliente)} className={`w-full text-left px-4 py-2 text-sm ${cliente.activo ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}>
                    {cliente.activo ? "Desactivar" : "Activar"}
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <NuevoAseguradoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} clienteAEditar={clienteAEditar} />
      <Toast message="Asegurado guardado correctamente" isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}