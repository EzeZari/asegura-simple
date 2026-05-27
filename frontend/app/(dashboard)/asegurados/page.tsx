"use client";

import { useState, useEffect } from "react";
import { Search, Download, UploadCloud } from "lucide-react"; 
import NuevoAseguradoModal from "@/components/asegurados/NuevoAseguradoModal";
import AseguradosFiltros from "@/components/asegurados/AseguradosFiltros";
import ExportarExcelModal from "@/components/ui/ExportarExcelModal"; 
import ImportarAseguradosModal from "@/components/asegurados/ImportarAseguradosModal"; 
import Toast from "@/components/ui/Toast";
import Table, { TableColumn } from "@/components/ui/Table";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PolizasDelAseguradoModal from "@/components/asegurados/PolizasDelAseguradoModal";
import { useTableSort } from "@/hooks/useTableSort";
import SortableHeader from "@/components/ui/SortableHeader";
import PageHeader from "@/components/ui/PageHeader";
import AlertModal from "@/components/ui/AlertModal";
import AseguradoTableRow from "@/components/asegurados/AseguradoTableRow";
import SelectOrdenamiento from "@/components/ui/SelectOrdenamiento";

const OPCIONES_ORDEN = [
  { value: "mas_recientes", label: "Más recientes primero" },
  { value: "mas_antiguos", label: "Más antiguos primero" },
  { value: "alfabetico", label: "A-Z (Nombre/Razón Social)" },
  { value: "mas_polizas", label: "Mayor cantidad de pólizas" },
];

export default function AseguradosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  
  const [ordenActual, setOrdenActual] = useState("mas_recientes");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); 
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); 
  const [clienteAEditar, setClienteAEditar] = useState<any>(null);
  const [asegurados, setAsegurados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  
  const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [aseguradoAEliminar, setAseguradoAEliminar] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [aseguradoParaVerPolizas, setAseguradoParaVerPolizas] = useState<any>(null);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertModalInfo, setAlertModalInfo] = useState({ title: "", message: "" });

  const fetchAsegurados = async () => {
    try {
      // 🔥 REEMPLAZO 1
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/asegurados`);
      setAsegurados(await res.json());
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAsegurados(); }, []);

  const toggleEstado = async (cliente: any) => {
    try {
      // 🔥 REEMPLAZO 2
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/asegurados/${cliente.id}`, {
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
      // 🔥 REEMPLAZO 3
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/asegurados/${aseguradoAEliminar.id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      
      fetchAsegurados();
      setMensajeToast("Asegurado eliminado correctamente");
      setShowToast(true);
      setIsConfirmOpen(false);
    } catch (error: any) { 
      setIsConfirmOpen(false); 
      
      if (error.message.includes("pólizas activas")) {
        setAlertModalInfo({
          title: "No se puede eliminar",
          message: "Este asegurado tiene pólizas cargadas en el sistema. Por seguridad, primero debés dar de baja o eliminar sus pólizas vinculadas."
        });
      } else {
        setAlertModalInfo({
          title: "Error de operación",
          message: error.message
        });
      }
      
      setTimeout(() => setIsAlertModalOpen(true), 150);
    } finally { 
      setIsDeleting(false); 
      setAseguradoAEliminar(null); 
    }
  };

  const handleImportSuccess = (mensaje: string) => {
    setIsImportModalOpen(false);
    fetchAsegurados(); 
    setMensajeToast(mensaje);
    setShowToast(true);
  };

  let aseguradosFiltrados = asegurados.filter((cliente) => {
    const busqueda = searchTerm.toLowerCase();
    const nombreCompleto = `${cliente.nombre} ${cliente.apellido || ""}`.toLowerCase();
    const pasaFiltroTexto = nombreCompleto.includes(busqueda) || cliente.dni.includes(busqueda);
    const pasaFiltroTipo = filtroTipo === "Todos" || cliente.tipo === filtroTipo;
    const pasaFiltroEstado = filtroEstado === "Todos" || (filtroEstado === "Activos" && cliente.activo) || (filtroEstado === "Inactivos" && !cliente.activo);
    return pasaFiltroTexto && pasaFiltroTipo && pasaFiltroEstado;
  });

  aseguradosFiltrados = aseguradosFiltrados.sort((a, b) => {
    switch (ordenActual) {
      case "mas_recientes": return b.id - a.id;
      case "mas_antiguos": return a.id - b.id;
      case "mas_polizas":
        const polizasA = a._count?.polizas || 0;
        const polizasB = b._count?.polizas || 0;
        return polizasB - polizasA;
      case "alfabetico":
        const nombreA = `${a.nombre} ${a.apellido || ""}`.toLowerCase().trim();
        const nombreB = `${b.nombre} ${b.apellido || ""}`.toLowerCase().trim();
        return nombreA.localeCompare(nombreB);
      default: return 0;
    }
  });

  const { items: aseguradosOrdenados, requestSort, sortConfig } = useTableSort(aseguradosFiltrados);

  const prepararDatosParaExcel = () => {
    return aseguradosOrdenados.map((cliente) => ({
      "Nombre / Razón Social": `${cliente.nombre} ${cliente.apellido || ""}`.trim(),
      "DNI / CUIT": cliente.dni,
      "Teléfono": cliente.telefono || "-",
      "Email": cliente.email || "-",
      "Tipo de Cliente": cliente.tipo,
      "Fecha de Alta": new Date(cliente.fechaRegistro).toLocaleDateString("es-AR"),
      "Cant. Pólizas Activas": cliente._count?.polizas || 0,
      "Estado en Sistema": cliente.activo ? "Activo" : "Inactivo",
    }));
  };

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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full -mb-4">
        <div className="w-full md:w-auto">
          <SelectOrdenamiento opciones={OPCIONES_ORDEN} valorActual={ordenActual} onChange={setOrdenActual} />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm">
            <UploadCloud size={16} /> Importar Excel
          </button>
          <button onClick={() => { if(aseguradosOrdenados.length === 0) return alert("No hay datos para exportar."); setIsExportModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm">
            <Download size={16} /> Exportar a Excel
          </button>
        </div>
      </div>

      <Table columns={columnas} isLoading={isLoading} isEmpty={aseguradosOrdenados.length === 0} emptyContent={<div className="flex flex-col items-center justify-center text-gray-500 py-6"><Search size={32} className="text-gray-300 mb-3" /><p className="font-medium text-gray-900">No se encontraron clientes</p></div>}>
        {aseguradosOrdenados.map((cliente) => (
          <AseguradoTableRow 
            key={cliente.id}
            cliente={cliente}
            onClickPolizas={(c) => setAseguradoParaVerPolizas(c)}
            menuAbiertoId={menuAbiertoId}
            onToggleMenu={setMenuAbiertoId}
            onEdit={(c) => { setClienteAEditar(c); setMenuAbiertoId(null); setIsModalOpen(true); }}
            onToggleEstado={toggleEstado}
            onEliminar={(c) => { setAseguradoAEliminar(c); setMenuAbiertoId(null); setIsConfirmOpen(true); }}
          />
        ))}
      </Table>

      <NuevoAseguradoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchAsegurados(); setShowToast(true); setMensajeToast("Asegurado guardado correctamente"); }} clienteAEditar={clienteAEditar} />
      <ExportarExcelModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} datos={prepararDatosParaExcel()} nombreArchivo={`Reporte_Clientes_${new Date().toISOString().split("T")[0]}`} />
      <ImportarAseguradosModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={handleImportSuccess} />
      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={ejecutarEliminacion} isLoading={isDeleting} title="¿Eliminar asegurado?" message={`Esta acción eliminará a "${aseguradoAEliminar?.nombre} ${aseguradoAEliminar?.apellido || ''}" permanentemente. Solo es posible si no tiene pólizas activas.`} />
      <PolizasDelAseguradoModal isOpen={!!aseguradoParaVerPolizas} onClose={() => setAseguradoParaVerPolizas(null)} asegurado={aseguradoParaVerPolizas} />
      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
      <AlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} title={alertModalInfo.title} message={alertModalInfo.message} />
    </div>
  );
}