"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import NuevaPolizaModal from "@/components/polizas/NuevaPolizaModal";
import PolizasFiltros from "@/components/polizas/PolizasFiltros";
import Toast from "@/components/ui/Toast";
import Table, { TableColumn } from "@/components/ui/Table";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useTableSort } from "@/hooks/useTableSort";
import SortableHeader from "@/components/ui/SortableHeader";
import PageHeader from "@/components/ui/PageHeader";

// IMPORTAMOS NUESTRO NUEVO COMPONENTE LIMPIO
import PolizaTableRow from "@/components/polizas/PolizaTableRow";

export default function PolizasPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRama, setFiltroRama] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const polizasFiltradas = polizas.filter((poliza) => {
    const busqueda = searchTerm.toLowerCase();
    const matchBusqueda = 
      poliza.nroPoliza.toLowerCase().includes(busqueda) || 
      `${poliza.asegurado?.nombre} ${poliza.asegurado?.apellido}`.toLowerCase().includes(busqueda) ||
      (poliza.patente && poliza.patente.toLowerCase().includes(busqueda)) ||
      (poliza.marca && poliza.marca.toLowerCase().includes(busqueda)) ||
      (poliza.modelo && poliza.modelo.toLowerCase().includes(busqueda)) ||
      (poliza.ubicacionRiesgo && poliza.ubicacionRiesgo.toLowerCase().includes(busqueda));

    const matchRama = filtroRama === "Todas" || poliza.tipoPoliza === filtroRama;
    const matchEstado = filtroEstado === "Todos" || poliza.estado === filtroEstado;
    return matchBusqueda && matchRama && matchEstado;
  });

  const { items: polizasOrdenadas, requestSort, sortConfig } = useTableSort(polizasFiltradas);

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
      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={ejecutarEliminacion} isLoading={isDeleting} title="¿Eliminar póliza?" message={`Esta acción eliminará la póliza #${polizaAEliminar?.nroPoliza} permanentemente.`} />
      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}