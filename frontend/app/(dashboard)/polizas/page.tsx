"use client";

import { useState, useEffect } from "react";
import { FileText, Download, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import NuevaPolizaModal from "@/components/polizas/NuevaPolizaModal";
import PolizasFiltros from "@/components/polizas/PolizasFiltros";
import ExportarExcelModal from "@/components/ui/ExportarExcelModal"; 
import ImportarPolizasModal from "@/components/polizas/ImportarPolizasModal";
import Toast from "@/components/ui/Toast";
import Table, { TableColumn } from "@/components/ui/Table";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useTableSort } from "@/hooks/useTableSort";
import SortableHeader from "@/components/ui/SortableHeader";
import PageHeader from "@/components/ui/PageHeader";
import PolizaTableRow from "@/components/polizas/PolizaTableRow";
import SelectOrdenamiento from "@/components/ui/SelectOrdenamiento"; // <-- Importamos el componente

// Opciones disponibles para el selector
const OPCIONES_ORDEN = [
  { value: "mas_recientes", label: "Más recientes primero" },
  { value: "mas_antiguas", label: "Más antiguas primero" },
  { value: "vencimiento_proximo", label: "Próximas a vencer" },
  { value: "alfabetico_asegurado", label: "A-Z (Asegurado)" },
];

export default function PolizasPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRama, setFiltroRama] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  
  // 🔥 Nuevo estado para el ordenamiento (arranca en más recientes)
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
    try {
      const res = await fetch("http://localhost:3001/api/polizas");
      setPolizas(await res.json());
    } catch (error) { console.error("Error al cargar pólizas:", error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPolizas(); }, []);

  const cambiarEstadoRapido = async (poliza: any, nuevoEstado: string) => {
    setMenuAbiertoId(null);
    try {
      await fetch(`http://localhost:3001/api/polizas/${poliza.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`http://localhost:3001/api/polizas/${polizaAEliminar.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      fetchPolizas();
      setMensajeToast("Póliza eliminada correctamente");
      setShowToast(true);
      setIsConfirmOpen(false);
    } catch (error: any) { alert(error.message); } finally { setIsDeleting(false); setPolizaAEliminar(null); }
  };

  const enviarAvisoVencimiento = async (poliza: any) => {
    setMenuAbiertoId(null);
    try {
      const res = await fetch(`http://localhost:3001/api/polizas/${poliza.id}/avisar-vencimiento`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensajeToast("Correo de aviso enviado exitosamente");
      setShowToast(true);
      fetchPolizas(); 
    } catch (error: any) {
      alert(error.message); 
    }
  };

  const getEstadoInteligente = (poliza: any) => {
    if (poliza.estado === "Anulada" || poliza.estado === "Renovada") return poliza.estado;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    const vencimiento = new Date(poliza.fechaVencimiento);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Vencida";
    if (diffDays <= 15) return "Próxima a Vencer"; 
    return poliza.estado; 
  };

  // 1. Filtramos las pólizas como siempre
  let polizasFiltradas = polizas.filter((poliza) => {
    const busqueda = searchTerm.toLowerCase();
    const matchBusqueda = 
      poliza.nroPoliza.toLowerCase().includes(busqueda) || 
      `${poliza.asegurado?.nombre} ${poliza.asegurado?.apellido}`.toLowerCase().includes(busqueda) ||
      (poliza.patente && poliza.patente.toLowerCase().includes(busqueda)) ||
      (poliza.marca && poliza.marca.toLowerCase().includes(busqueda)) ||
      (poliza.modelo && poliza.modelo.toLowerCase().includes(busqueda)) ||
      (poliza.ubicacionRiesgo && poliza.ubicacionRiesgo.toLowerCase().includes(busqueda));

    const matchRama = filtroRama === "Todas" || poliza.tipoPoliza === filtroRama;
    const estadoReal = getEstadoInteligente(poliza);
    const matchEstado = filtroEstado === "Todos" || estadoReal === filtroEstado;
    
    return matchBusqueda && matchRama && matchEstado;
  });

  // 🔥 2. Aplicamos el ordenamiento lógico antes de pasarlas a la tabla
  polizasFiltradas = polizasFiltradas.sort((a, b) => {
    switch (ordenActual) {
      case "mas_recientes":
        // Compara por ID descendente (el ID más alto es el más nuevo en la BD)
        return b.id - a.id;
      case "mas_antiguas":
        // Compara por ID ascendente
        return a.id - b.id;
      case "vencimiento_proximo":
        // Ordena por fecha de vencimiento más cercana (solo si no están vencidas/anuladas idealmente)
        return new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime();
      case "alfabetico_asegurado":
        // Ordena alfabéticamente por el nombre del asegurado
        const nombreA = `${a.asegurado?.nombre} ${a.asegurado?.apellido}`.toLowerCase();
        const nombreB = `${b.asegurado?.nombre} ${b.asegurado?.apellido}`.toLowerCase();
        return nombreA.localeCompare(nombreB);
      default:
        return 0;
    }
  });

  // 3. El useTableSort sigue funcionando por si el usuario hace clic en los headers de las columnas
  const { items: polizasOrdenadas, requestSort, sortConfig } = useTableSort(polizasFiltradas);

  const prepararDatosParaExcel = () => {
    return polizasOrdenadas.map((p) => ({
      "Nro Póliza": p.nroPoliza,
      "Asegurado": `${p.asegurado?.nombre || ""} ${p.asegurado?.apellido || ""}`.trim(),
      "DNI / CUIT": p.asegurado?.dni || "",
      "Compañía": p.compania?.nombre || "",
      "Rama / Riesgo": p.tipoPoliza,
      "Cobertura": p.cobertura || "",
      "Patente": p.patente?.toUpperCase() || "",
      "Marca / Modelo": `${p.marca || ""} ${p.modelo || ""}`.trim(),
      "Ubicación": p.ubicacionRiesgo || "",
      "Empleados": p.cantidadEmpleados?.toString() || "",
      "Vigencia Desde": new Date(p.fechaInicio).toLocaleDateString("es-AR"),
      "Vigencia Hasta": new Date(p.fechaVencimiento).toLocaleDateString("es-AR"),
      "Estado": getEstadoInteligente(p),
    }));
  };

  const columnas: TableColumn[] = [
    { label: <SortableHeader label="Nro Póliza" sortKey="nroPoliza" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: "Titular" },
    { label: "Compañía" },
    { label: <SortableHeader label="Rama / Cobertura" sortKey="tipoPoliza" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: "Detalle del Riesgo" },
    { label: <SortableHeader label="Vigencia" sortKey="fechaVencimiento" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: <SortableHeader label="Estado" sortKey="estado" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: "Acciones", align: "right" },
  ];

  return (
    <div className="flex flex-col p-8 w-full gap-8 bg-white min-h-screen overflow-x-hidden">
      
      <PageHeader 
        titulo="Pólizas" 
        descripcion="Gestioná las coberturas activas de tus clientes." 
        textoBoton="Nueva Póliza" 
        onNuevo={() => { setPolizaAEditar(null); setIsModalOpen(true); }} 
      />

      <PolizasFiltros 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        filtroRama={filtroRama} setFiltroRama={setFiltroRama}
        filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado}
      />

      {/* 🔥 BARRA DE ACCIONES (Ordenamiento a la Izquierda, Botones a la Derecha) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full -mb-4">
        
        {/* Selector de Ordenamiento */}
        <div className="w-full md:w-auto">
          <SelectOrdenamiento 
            opciones={OPCIONES_ORDEN}
            valorActual={ordenActual}
            onChange={setOrdenActual}
          />
        </div>

        {/* Botones de Importar/Exportar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm"
          >
            <UploadCloud size={16} /> Importar Excel
          </button>
          <button
            onClick={() => {
              if(polizasOrdenadas.length === 0) return alert("No hay datos para exportar.");
              setIsExportModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm"
          >
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
            onEdit={(p) => { setPolizaAEditar(p); setIsModalOpen(true); }}
            onAvisarVencimiento={enviarAvisoVencimiento}
            onCambiarEstado={cambiarEstadoRapido}
            onEliminar={(p) => { setPolizaAEliminar(p); setIsConfirmOpen(true); }}
          />
        ))}
      </Table>

      <NuevaPolizaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchPolizas(); setShowToast(true); setMensajeToast("Póliza guardada con éxito"); }} polizaAEditar={polizaAEditar} />
      
      <ImportarPolizasModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={(mensaje) => {
          setIsImportModalOpen(false);
          fetchPolizas();
          setMensajeToast(mensaje);
          setShowToast(true);
        }} 
      />

      <ExportarExcelModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        datos={prepararDatosParaExcel()} 
        nombreArchivo={`Reporte_Polizas_${new Date().toISOString().split("T")[0]}`} 
      />

      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={ejecutarEliminacion} isLoading={isDeleting} title="¿Eliminar póliza?" message={`Esta acción eliminará la póliza #${polizaAEliminar?.nroPoliza} permanentemente.`} />
      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}