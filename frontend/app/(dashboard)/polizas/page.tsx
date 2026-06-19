"use client";

import { useState, useEffect } from "react";
import { FileText, Download, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import NuevaPolizaModal from "@/components/polizas/NuevaPolizaModal";
import PolizasFiltros from "@/components/polizas/PolizasFiltros";
import Toast from "@/components/ui/Toast";
import Table, { TableColumn } from "@/components/ui/Table";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useTableSort } from "@/hooks/useTableSort";
import SortableHeader from "@/components/ui/SortableHeader";
import PageHeader from "@/components/ui/PageHeader";
import PolizaTableRow from "@/components/polizas/PolizaTableRow";
import SelectOrdenamiento from "@/components/ui/SelectOrdenamiento";
import { apiFetch } from "@/services/api";
import { useAuthStore } from "@/store/authStore"; // 🔥 Importamos la memoria

const ExportarExcelModal = dynamic(() => import("@/components/ui/ExportarExcelModal"), { ssr: false });
const ImportarPolizasModal = dynamic(() => import("@/components/polizas/ImportarPolizasModal"), { ssr: false });

const OPCIONES_ORDEN = [
  { value: "mas_recientes", label: "Más recientes primero" },
  { value: "mas_antiguas", label: "Más antiguas primero" },
  { value: "vencimiento_proximo", label: "Próximas a vencer" },
  { value: "alfabetico_asegurado", label: "A-Z (Asegurado)" },
];

export default function PolizasPage() {
  // 🔥 LEEMOS EL ROL
  const { user } = useAuthStore();
  const esSoloLectura = user?.role === "VIEWER";

  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRama, setFiltroRama] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [ordenActual, setOrdenActual] = useState("mas_recientes");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); 
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [polizaAEditar, setPolizaAEditar] = useState<any>(null);
  const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);
  const [polizas, setPolizas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [polizaAEliminar, setPolizaAEliminar] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPolizas = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/polizas');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setPolizas(data);
      } else {
        console.error("El backend no devolvió una lista válida:", data);
        setPolizas([]); 
        setMensajeToast(data.error || "Error de conexión con el servidor.");
        setShowToast(true);
      }
    } catch (error) { 
      console.error("Error al cargar pólizas:", error); 
      setPolizas([]);
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchPolizas(); }, []);

  const cambiarEstadoRapido = async (poliza: any, nuevoEstado: string) => {
    setMenuAbiertoId(null);
    try {
      await apiFetch(`/api/polizas/${poliza.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...poliza, estado: nuevoEstado }),
      });
      fetchPolizas();
      setMensajeToast(`Estado cambiado a ${nuevoEstado}`);
      setShowToast(true);
    } catch (error) { alert("Hubo un error al cambiar el estado."); } 
  };

  const ejecutarEliminacion = async () => {
    if (!polizaAEliminar) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/polizas/${polizaAEliminar.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      fetchPolizas();
      setMensajeToast("Póliza eliminada correctamente");
      setShowToast(true);
      setIsConfirmOpen(false);
    } catch (error: any) { alert(error.message); } finally { setIsDeleting(false); setPolizaAEliminar(null); }
  };

  const enviarAvisoVencimiento = async (poliza: any) => {
    setMenuAbiertoId(null);
    try {
      const res = await apiFetch(`/api/polizas/${poliza.id}/avisar-vencimiento`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar aviso");
      setMensajeToast("Correo de aviso enviado exitosamente");
      setShowToast(true);
      fetchPolizas(); 
    } catch (error: any) { alert(error.message); }
  };

  const getEstadoInteligente = (poliza: any) => {
    if (!poliza) return "Desconocido";
    if (poliza.estado === "Anulada" || poliza.estado === "Renovada") return poliza.estado;
    if (!poliza.fechaVencimiento) return poliza.estado;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    const vencimiento = new Date(poliza.fechaVencimiento);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Vencida";
    if (diffDays <= 15) return "Próxima a Vencer"; 
    return poliza.estado; 
  };

  let polizasFiltradas = (Array.isArray(polizas) ? polizas : []).filter((poliza) => {
    const busqueda = searchTerm.toLowerCase();
    
    const nroPoliza = String(poliza?.nroPoliza || "").toLowerCase();
    const nombreCompleto = `${poliza?.asegurado?.nombre || ""} ${poliza?.asegurado?.apellido || ""}`.toLowerCase();
    const patente = String(poliza?.patente || "").toLowerCase();
    const marca = String(poliza?.marca || "").toLowerCase();
    const modelo = String(poliza?.modelo || "").toLowerCase();
    const ubi = String(poliza?.ubicacionRiesgo || "").toLowerCase();

    const matchBusqueda = 
      nroPoliza.includes(busqueda) || 
      nombreCompleto.includes(busqueda) ||
      patente.includes(busqueda) ||
      marca.includes(busqueda) ||
      modelo.includes(busqueda) ||
      ubi.includes(busqueda);
      
    const matchRama = filtroRama === "Todas" || poliza?.tipoPoliza === filtroRama;
    const estadoReal = getEstadoInteligente(poliza);
    const matchEstado = filtroEstado === "Todos" || estadoReal === filtroEstado;
    
    return matchBusqueda && matchRama && matchEstado;
  });

  polizasFiltradas = polizasFiltradas.sort((a, b) => {
    switch (ordenActual) {
      case "mas_recientes": return b.id - a.id;
      case "mas_antiguas": return a.id - b.id;
      case "vencimiento_proximo": 
        const dateA = a.fechaVencimiento ? new Date(a.fechaVencimiento).getTime() : 0;
        const dateB = b.fechaVencimiento ? new Date(b.fechaVencimiento).getTime() : 0;
        return dateA - dateB;
      case "alfabetico_asegurado":
        const nombreA = `${a.asegurado?.nombre || ""} ${a.asegurado?.apellido || ""}`.toLowerCase();
        const nombreB = `${b.asegurado?.nombre || ""} ${b.asegurado?.apellido || ""}`.toLowerCase();
        return nombreA.localeCompare(nombreB);
      default: return 0;
    }
  });

  const { items: polizasOrdenadas, requestSort, sortConfig } = useTableSort(polizasFiltradas);

  const prepararDatosParaExcel = () => {
    return polizasOrdenadas.map((p) => ({
      "Nro Póliza": p.nroPoliza || "",
      "Asegurado": `${p.asegurado?.nombre || ""} ${p.asegurado?.apellido || ""}`.trim(),
      "DNI / CUIT": p.asegurado?.dni || "",
      "Compañía": p.compania?.nombre || "",
      "Rama / Riesgo": p.tipoPoliza || "",
      "Cobertura": p.cobertura || "",
      "Patente": p.patente?.toUpperCase() || "",
      "Marca / Modelo": `${p.marca || ""} ${p.modelo || ""}`.trim(),
      "Ubicación": p.ubicacionRiesgo || "",
      "Empleados": p.cantidadEmpleados?.toString() || "",
      "Vigencia Desde": p.fechaInicio ? new Date(p.fechaInicio).toLocaleDateString("es-AR") : "",
      "Vigencia Hasta": p.fechaVencimiento ? new Date(p.fechaVencimiento).toLocaleDateString("es-AR") : "",
      "Estado": getEstadoInteligente(p),
    }));
  };

  // 🔥 COLUMNAS DINÁMICAS
  const columnasBase: TableColumn[] = [
    { label: <SortableHeader label="Nro Póliza" sortKey="nroPoliza" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: "Titular" },
    { label: "Compañía" },
    { label: <SortableHeader label="Rama / Cobertura" sortKey="tipoPoliza" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: "Detalle del Riesgo" },
    { label: <SortableHeader label="Vigencia" sortKey="fechaVencimiento" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: <SortableHeader label="Estado" sortKey="estado" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
  ];

  const columnas = esSoloLectura 
    ? columnasBase 
    : [...columnasBase, { label: "Acciones", align: "right" as const }];

  return (
    <div className="flex flex-col p-4 lg:p-8 w-full gap-5 lg:gap-8 bg-white min-h-screen overflow-x-hidden">
      
      <PageHeader 
        titulo="Pólizas" 
        descripcion="Gestioná las coberturas activas de tus clientes." 
        textoBoton={esSoloLectura ? "" : "Nueva Póliza"} // 🔥 Ninja atajo
        onNuevo={esSoloLectura ? () => {} : () => { setPolizaAEditar(null); setIsModalOpen(true); }} // 🔥 Ninja atajo
      />
      
      <PolizasFiltros searchTerm={searchTerm} setSearchTerm={setSearchTerm} filtroRama={filtroRama} setFiltroRama={setFiltroRama} filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado} />
      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full -mb-2 lg:-mb-4">
        <div className="w-full xl:w-auto">
          <SelectOrdenamiento opciones={OPCIONES_ORDEN} valorActual={ordenActual} onChange={setOrdenActual} />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          
          {/* 🔥 IMPORTAR OCULTO PARA LECTOR */}
          {!esSoloLectura && (
            <button onClick={() => setIsImportModalOpen(true)} className="flex justify-center items-center gap-2 w-full sm:w-auto px-4 py-2.5 lg:py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm">
              <UploadCloud size={16} /> Importar Excel
            </button>
          )}

          <button onClick={() => { if(polizasOrdenadas.length === 0) return alert("No hay datos para exportar."); setIsExportModalOpen(true); }} className="flex justify-center items-center gap-2 w-full sm:w-auto px-4 py-2.5 lg:py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm">
            <Download size={16} /> Exportar a Excel
          </button>
        </div>
      </div>

      <Table columns={columnas} isLoading={isLoading} isEmpty={polizasOrdenadas.length === 0} emptyContent={<div className="flex flex-col items-center justify-center text-gray-500 py-6"><FileText size={32} className="text-gray-300 mb-3" /><p className="font-medium text-gray-900">No se encontraron pólizas</p></div>}>
        {polizasOrdenadas.map((poliza) => (
          <PolizaTableRow 
            key={poliza.id} 
            poliza={poliza} 
            onClickDetalle={(id) => router.push(`/polizas/${id}`)} 
            menuAbiertoId={menuAbiertoId} 
            onToggleMenu={setMenuAbiertoId} 
            // 🔥 ACCIONES NINJA PARA LECTOR
            onEdit={esSoloLectura ? () => {} : (p) => { setPolizaAEditar(p); setIsModalOpen(true); }} 
            onAvisarVencimiento={esSoloLectura ? () => {} : enviarAvisoVencimiento} 
            onCambiarEstado={esSoloLectura ? () => {} : cambiarEstadoRapido} 
            onEliminar={esSoloLectura ? () => {} : (p) => { setPolizaAEliminar(p); setIsConfirmOpen(true); }} 
          />
        ))}
      </Table>

      {/* 🔥 MODALES BLOQUEADOS PARA EL LECTOR */}
      {!esSoloLectura && (
        <>
          <NuevaPolizaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchPolizas(); setShowToast(true); setMensajeToast("Póliza guardada con éxito"); }} polizaAEditar={polizaAEditar} />
          <ImportarPolizasModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={(mensaje) => { setIsImportModalOpen(false); fetchPolizas(); setMensajeToast(mensaje); setShowToast(true); }} />
          <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={ejecutarEliminacion} isLoading={isDeleting} title="¿Eliminar póliza?" message={`Esta acción eliminará la póliza #${polizaAEliminar?.nroPoliza} permanentemente.`} />
        </>
      )}

      {/* Este modal de descarga sí lo puede ver el lector */}
      <ExportarExcelModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} datos={prepararDatosParaExcel()} nombreArchivo={`Reporte_Polizas_${new Date().toISOString().split("T")[0]}`} />
      
      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}