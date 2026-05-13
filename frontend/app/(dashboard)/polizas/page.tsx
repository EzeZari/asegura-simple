"use client";

import { useState, useEffect } from "react";
import { FileText, Trash2, Edit } from "lucide-react";
import NuevaPolizaModal from "@/components/polizas/NuevaPolizaModal";
import PolizasFiltros from "@/components/polizas/PolizasFiltros";
import Toast from "@/components/ui/Toast";
import Table, { TableColumn } from "@/components/ui/Table";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useRouter } from "next/navigation";
import { useTableSort } from "@/hooks/useTableSort";
import SortableHeader from "@/components/ui/SortableHeader";

// PIEZAS DE LEGO
import PageHeader from "@/components/ui/PageHeader";
import { ActionMenu, ActionMenuItem, ActionMenuDivider } from "@/components/ui/ActionMenu";

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

  const polizasFiltradas = polizas.filter((poliza) => {
    const busqueda = searchTerm.toLowerCase();
    const matchBusqueda = poliza.nroPoliza.toLowerCase().includes(busqueda) || `${poliza.asegurado?.nombre} ${poliza.asegurado?.apellido}`.toLowerCase().includes(busqueda);
    const matchRama = filtroRama === "Todas" || poliza.tipoPoliza === filtroRama;
    const matchEstado = filtroEstado === "Todos" || poliza.estado === filtroEstado;
    return matchBusqueda && matchRama && matchEstado;
  });

  const { items: polizasOrdenadas, requestSort, sortConfig } = useTableSort(polizasFiltradas);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Vigente":
      case "Renovada": return "bg-emerald-100 text-emerald-800";
      case "Pendiente de Pago": return "bg-amber-100 text-amber-800";
      case "Anulada": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const columnas: TableColumn[] = [
    { label: <SortableHeader label="Nro Póliza" sortKey="nroPoliza" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: "Titular" },
    { label: "Compañía" },
    { label: <SortableHeader label="Rama / Cobertura" sortKey="tipoPoliza" currentSort={sortConfig} requestSort={requestSort} /> },
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
          <tr key={poliza.id} className="hover:bg-gray-50/50 transition-colors group">
            <td 
              className="px-6 py-4 font-mono font-medium text-green-700 cursor-pointer hover:underline hover:text-green-800"
              onClick={() => router.push(`/polizas/${poliza.id}`)}
              title="Ver detalle completo"
            >
              #{poliza.nroPoliza}
            </td>
            <td className="px-6 py-4">
              <div className="font-medium text-gray-900">{poliza.asegurado?.nombre} {poliza.asegurado?.apellido}</div>
              <div className="text-xs text-gray-500">DNI: {poliza.asegurado?.dni}</div>
            </td>
            <td className="px-6 py-4 text-gray-700">{poliza.compania?.nombre || "-"}</td>
            <td className="px-6 py-4">
              <div className="font-medium text-gray-900">{poliza.tipoPoliza}</div>
              <div className="text-xs text-gray-500 truncate max-w-[150px]">{poliza.cobertura || "Sin detalle"}</div>
            </td>
            <td className="px-6 py-4">
              <div className="text-gray-900">{new Date(poliza.fechaInicio).toLocaleDateString("es-AR")}</div>
              <div className="text-xs text-gray-500">al {new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR")}</div>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getEstadoBadge(poliza.estado)}`}>
                {poliza.estado}
              </span>
            </td>
            <td className="px-6 py-4 text-right relative">
              <ActionMenu isOpen={menuAbiertoId === poliza.id} onToggle={() => setMenuAbiertoId(menuAbiertoId === poliza.id ? null : poliza.id)}>
                <ActionMenuItem icon={Edit} label="Editar Póliza" onClick={() => { setPolizaAEditar(poliza); setMenuAbiertoId(null); setIsModalOpen(true); }} />
                <ActionMenuDivider />
                {poliza.estado !== "Vigente" && <ActionMenuItem icon={FileText} label="Marcar Vigente" color="green" onClick={() => cambiarEstadoRapido(poliza, "Vigente")} />}
                {poliza.estado !== "Pendiente de Pago" && <ActionMenuItem icon={FileText} label="Marcar Pendiente" color="amber" onClick={() => cambiarEstadoRapido(poliza, "Pendiente de Pago")} />}
                {poliza.estado !== "Anulada" && <ActionMenuItem icon={Trash2} label="Anular Póliza" color="red" onClick={() => cambiarEstadoRapido(poliza, "Anulada")} />}
                <ActionMenuDivider />
                <ActionMenuItem icon={Trash2} label="Eliminar Póliza" color="red" onClick={() => { setPolizaAEliminar(poliza); setMenuAbiertoId(null); setIsConfirmOpen(true); }} />
              </ActionMenu>
            </td>
          </tr>
        ))}
      </Table>

      <NuevaPolizaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchPolizas(); setShowToast(true); setMensajeToast("Póliza guardada con éxito"); }} polizaAEditar={polizaAEditar} />
      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={ejecutarEliminacion} isLoading={isDeleting} title="¿Eliminar póliza?" message={`Esta acción eliminará la póliza #${polizaAEliminar?.nroPoliza} permanentemente.`} />
      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}