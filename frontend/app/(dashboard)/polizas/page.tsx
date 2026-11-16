"use client";

import { useState, useEffect } from "react";
import { FileText, UploadCloud, ChevronLeft, ChevronRight } from "lucide-react"; 
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
import PolizaMobileCard from "@/components/polizas/PolizaMobileCard"; 
import SelectOrdenamiento from "@/components/ui/SelectOrdenamiento";
import { apiFetch } from "@/services/api";
import { useAuthStore } from "@/store/authStore"; 
import { PERMISOS, tienePermiso } from "@/utils/roles"; 
import ExportButton from "@/components/ui/ExportButton";

const ExportarExcelModal = dynamic(() => import("@/components/ui/ExportarExcelModal"), { ssr: false });
const ImportarPolizasModal = dynamic(() => import("@/components/polizas/ImportarPolizasModal"), { ssr: false });

const OPCIONES_ORDEN = [
  { value: "mas_recientes", label: "Más recientes primero" },
  { value: "mas_antiguas", label: "Más antiguas primero" },
  { value: "vencimiento_proximo", label: "Próximas a vencer" },
  { value: "alfabetico_asegurado", label: "A-Z (Asegurado)" },
];

export default function PolizasPage() {
  const { user } = useAuthStore();
  const puedeModificar = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRama, setFiltroRama] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [ordenActual, setOrdenActual] = useState("mas_recientes");
  
  // 🔥 ESTADOS PARA PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Reiniciar a la página 1 cada vez que cambiamos un filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroRama, filtroEstado, ordenActual, itemsPerPage]);

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
      const res = await apiFetch(`/api/polizas/${poliza.id}/aviso`, { method: "POST" });
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

  // 🔥 LÓGICA DE PAGINACIÓN APLICADA
  const totalItems = polizasOrdenadas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPolizas = polizasOrdenadas.slice(startIndex, startIndex + itemsPerPage);

  const prepararDatosParaExcel = () => {
    return polizasOrdenadas.map((p) => ({
      "Nro Póliza": p.nroPoliza || "",
      "Asegurado": `${p.asegurado?.nombre || ""} ${p.asegurado?.apellido || ""}`.trim(),
      "DNI / CUIT": p.asegurado?.dni || "",
      "Compañía": p.compania?.nombre || "",
      "Rama / Riesgo": p.tipoPoliza || "",
      "Cobertura": p.cobertura || "",
      "Suma Asegurada": p.sumaAsegurada || "",
      "Cláusula Ajuste": p.clausulaAjuste || "",
      "Patente": p.patente?.toUpperCase() || "",
      "Marca / Modelo": `${p.marca || ""} ${p.modelo || ""}`.trim(),
      "Año": p.anio || "",
      "Color": p.color || "",
      "Nro Motor": p.motor?.toUpperCase() || "",
      "Nro Chasis": p.chasis?.toUpperCase() || "",
      "Ubicación": p.ubicacionRiesgo || "",
      "Empleados": p.cantidadEmpleados?.toString() || "",
      "Vigencia Desde": p.fechaInicio ? new Date(p.fechaInicio).toLocaleDateString("es-AR") : "",
      "Vigencia Hasta": p.fechaVencimiento ? new Date(p.fechaVencimiento).toLocaleDateString("es-AR") : "",
      "Forma de Pago": p.formaPago || "No especificada", 
      "Estado": getEstadoInteligente(p),
    }));
  };

  const columnasBase: TableColumn[] = [
    { label: <SortableHeader label="Nro Póliza" sortKey="nroPoliza" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} />, isStickyLeft: true },
    { label: "Titular" },
    { label: "Compañía" },
    { label: <SortableHeader label="Rama / Cobertura" sortKey="tipoPoliza" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: "Patente / Detalle" },
    { label: <SortableHeader label="Vigencia" sortKey="fechaVencimiento" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: "Forma de Pago" }, 
    { label: <SortableHeader label="Estado" sortKey="estado" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
  ];

  const columnas = puedeModificar 
    ? [...columnasBase, { label: "Acciones", align: "right" as const, isStickyRight: true }]
    : columnasBase;

  return (
    // 🔥 AJUSTE 1: Se quitó el margen inferior gigante (pb-24 lg:pb-32)
    <div className="flex flex-col p-4 lg:p-8 w-full min-w-0 max-w-full gap-5 lg:gap-8 min-h-[calc(100vh-2rem)] transition-colors duration-300">
      
      <PageHeader 
        titulo="Pólizas" 
        descripcion="Gestioná las coberturas activas de tus clientes." 
        textoBoton={puedeModificar ? "Nueva Póliza" : ""} 
        onNuevo={puedeModificar ? () => { setPolizaAEditar(null); setIsModalOpen(true); } : undefined} 
      />
      
      <PolizasFiltros searchTerm={searchTerm} setSearchTerm={setSearchTerm} filtroRama={filtroRama} setFiltroRama={setFiltroRama} filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado} />
      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full -mb-2 lg:-mb-4">
        <div className="w-full xl:w-auto">
          <SelectOrdenamiento opciones={OPCIONES_ORDEN} valorActual={ordenActual} onChange={setOrdenActual} />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          
          {puedeModificar && (
            <button onClick={() => setIsImportModalOpen(true)} className="flex justify-center items-center gap-2 w-full sm:w-auto px-4 py-2.5 lg:py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm">
              <UploadCloud size={16} /> Importar Excel
            </button>
          )}

          <ExportButton 
            onExport={() => setIsExportModalOpen(true)} 
            datosVacios={polizasOrdenadas.length === 0} 
          />
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        
        {/* 🔥 VISTA ESCRITORIO */}
        <div className="hidden md:block">
          <Table columns={columnas} isLoading={isLoading} isEmpty={paginatedPolizas.length === 0} emptyContent={<div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 py-6 transition-colors"><FileText size={32} className="text-gray-300 dark:text-gray-600 mb-3" /><p className="font-medium text-gray-900 dark:text-white">No se encontraron pólizas</p></div>}>
            {paginatedPolizas.map((poliza) => (
              <PolizaTableRow 
                key={poliza.id} 
                poliza={poliza} 
                onClickDetalle={(id) => router.push(`/polizas/${id}`)} 
                menuAbiertoId={menuAbiertoId} 
                onToggleMenu={setMenuAbiertoId} 
                puedeModificar={puedeModificar}
                onEdit={puedeModificar ? (p) => { setPolizaAEditar(p); setIsModalOpen(true); } : undefined} 
                onAvisarVencimiento={puedeModificar ? enviarAvisoVencimiento : undefined} 
                onCambiarEstado={puedeModificar ? cambiarEstadoRapido : undefined} 
                onEliminar={puedeModificar ? (p) => { setPolizaAEliminar(p); setIsConfirmOpen(true); } : undefined} 
              />
            ))}
          </Table>
        </div>

        {/* 🔥 VISTA CELULAR */}
        <div className="block md:hidden">
          {isLoading ? (
             <div className="text-center py-8 text-gray-500 animate-pulse">Cargando pólizas...</div>
          ) : paginatedPolizas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <FileText size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
              <p className="font-medium text-gray-900 dark:text-white">No se encontraron pólizas</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {paginatedPolizas.map((poliza) => (
                <PolizaMobileCard 
                  key={poliza.id}
                  poliza={poliza}
                  onClickDetalle={(id) => router.push(`/polizas/${id}`)}
                  menuAbiertoId={menuAbiertoId}
                  onToggleMenu={setMenuAbiertoId}
                  puedeModificar={puedeModificar}
                  onEdit={puedeModificar ? (p) => { setPolizaAEditar(p); setIsModalOpen(true); } : undefined}
                  onAvisarVencimiento={puedeModificar ? enviarAvisoVencimiento : undefined}
                  onCambiarEstado={puedeModificar ? cambiarEstadoRapido : undefined}
                  onEliminar={puedeModificar ? (p) => { setPolizaAEliminar(p); setIsConfirmOpen(true); } : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* 🔥 PAGINACIÓN UI */}
        {!isLoading && totalItems > 0 && (
          // 🔥 AJUSTE 2: Se ajustó el pr-16 (padding-right) para mover los botones más a la derecha esquivando el chat.
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 md:pr-16 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors mt-2">
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Mostrar</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-emerald-500 outline-none transition-colors px-2 py-1.5 cursor-pointer font-medium"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-500 dark:text-gray-400">filas</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Mostrando del <strong className="text-gray-900 dark:text-gray-100">{startIndex + 1}</strong> al <strong className="text-gray-900 dark:text-gray-100">{Math.min(startIndex + itemsPerPage, totalItems)}</strong> de <strong className="text-gray-900 dark:text-gray-100">{totalItems}</strong>
              </span>
              
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center justify-center px-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Siguiente"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {puedeModificar && (
        <>
          <NuevaPolizaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchPolizas(); setShowToast(true); setMensajeToast("Póliza guardada con éxito"); }} polizaAEditar={polizaAEditar} />
          <ImportarPolizasModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={(mensaje) => { setIsImportModalOpen(false); fetchPolizas(); setMensajeToast(mensaje); setShowToast(true); }} />
          <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={ejecutarEliminacion} isLoading={isDeleting} title="¿Eliminar póliza?" message={`Esta acción eliminará la póliza #${polizaAEliminar?.nroPoliza} permanentemente.`} />
        </>
      )}

      <ExportarExcelModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} datos={prepararDatosParaExcel()} nombreArchivo={`Reporte_Polizas_${new Date().toISOString().split("T")[0]}`} />
      
      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}