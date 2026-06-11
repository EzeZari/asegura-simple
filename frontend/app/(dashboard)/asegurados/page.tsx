"use client";

import { useState, useEffect } from "react";
import { Search, Download, UploadCloud } from "lucide-react"; 
import dynamic from "next/dynamic";

import NuevoAseguradoModal from "@/components/asegurados/NuevoAseguradoModal";
import AseguradosFiltros from "@/components/asegurados/AseguradosFiltros";
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
import { apiFetch } from "@/services/api";

const ExportarExcelModal = dynamic(() => import("@/components/ui/ExportarExcelModal"), { ssr: false });
const ImportarAseguradosModal = dynamic(() => import("@/components/asegurados/ImportarAseguradosModal"), { ssr: false });

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
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/asegurados');
      const data = await res.json();
      
      // 🔥 PROTECCIÓN ANTI-CRASH
      if (Array.isArray(data)) {
        setAsegurados(data);
      } else {
        console.error("El backend no devolvió una lista:", data);
        setAsegurados([]);
        setMensajeToast(data.error || "Error al cargar asegurados.");
        setShowToast(true);
      }
    } catch (error) { 
      console.error(error); 
      setAsegurados([]);
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchAsegurados(); }, []);

  const toggleEstado = async (cliente: any) => {
    try {
      await apiFetch(`/api/asegurados/${cliente.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...cliente, activo: !cliente.activo }),
      });
      fetchAsegurados();
    } catch (error) { console.error(error); } finally { setMenuAbiertoId(null); }
  };

  const ejecutarEliminacion = async () => {
    if (!aseguradoAEliminar) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/asegurados/${aseguradoAEliminar.id}`, { method: 'DELETE' });
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

  // 🔥 PROTECCIÓN DE FILTROS: Manejamos nulos y aseguramos que es un Array
  let aseguradosFiltrados = (Array.isArray(asegurados) ? asegurados : []).filter((cliente) => {
    const busqueda = searchTerm.toLowerCase();
    const nombreCompleto = `${cliente?.nombre || ""} ${cliente?.apellido || ""}`.toLowerCase();
    const dniSeguro = String(cliente?.dni || "").toLowerCase();
    
    const pasaFiltroTexto = nombreCompleto.includes(busqueda) || dniSeguro.includes(busqueda);
    const pasaFiltroTipo = filtroTipo === "Todos" || cliente?.tipo === filtroTipo;
    const pasaFiltroEstado = filtroEstado === "Todos" || (filtroEstado === "Activos" && cliente?.activo) || (filtroEstado === "Inactivos" && !cliente?.activo);
    
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
        const nombreA = `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase().trim();
        const nombreB = `${b.nombre || ""} ${b.apellido || ""}`.toLowerCase().trim();
        return nombreA.localeCompare(nombreB);
      default: return 0;
    }
  });

  const { items: aseguradosOrdenados, requestSort, sortConfig } = useTableSort(aseguradosFiltrados);

  const prepararDatosParaExcel = () => {
    return aseguradosOrdenados.map((cliente) => ({
      "Nombre / Razón Social": `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim(),
      "DNI / CUIT": cliente.dni || "",
      "Teléfono": cliente.telefono || "-",
      "Email": cliente.email || "-",
      "Tipo de Cliente": cliente.tipo || "",
      "Fecha de Alta": cliente.fechaRegistro ? new Date(cliente.fechaRegistro).toLocaleDateString("es-AR") : "",
      "Cant. Pólizas Activas": cliente._count?.polizas || 0,
      "Estado en Sistema": cliente.activo ? "Activo" : "Inactivo",
    }));
  };

  const columnas: TableColumn[] = [
    { label: <SortableHeader label="Nombre / Razón Social" sortKey="nombre" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: <SortableHeader label="DNI / CUIT" sortKey="dni" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: "Contacto" },
    { label: <SortableHeader label="Tipo" sortKey="tipo" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: <SortableHeader label="Fecha de Alta" sortKey="fechaRegistro" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: "Pólizas", align: "center" },
    { label: <SortableHeader label="Estado" sortKey="activo" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: "Acciones", align: "right" },
  ];
 
  return (
    <div className="flex flex-col p-4 lg:p-8 w-full gap-5 lg:gap-8 bg-white min-h-screen overflow-x-hidden">
      
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

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full -mb-2 lg:-mb-4">
        <div className="w-full xl:w-auto">
          <SelectOrdenamiento opciones={OPCIONES_ORDEN} valorActual={ordenActual} onChange={setOrdenActual} />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <button onClick={() => setIsImportModalOpen(true)} className="flex justify-center items-center gap-2 w-full sm:w-auto px-4 py-2.5 lg:py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm">
            <UploadCloud size={16} /> Importar Excel
          </button>
          <button onClick={() => { if(aseguradosOrdenados.length === 0) return alert("No hay datos para exportar."); setIsExportModalOpen(true); }} className="flex justify-center items-center gap-2 w-full sm:w-auto px-4 py-2.5 lg:py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm">
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