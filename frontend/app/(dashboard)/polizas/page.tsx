"use client";

import { useState, useEffect } from "react";
import { FileText, Trash2, Edit, Mail } from "lucide-react";
import NuevaPolizaModal from "@/components/polizas/NuevaPolizaModal";
import PolizasFiltros from "@/components/polizas/PolizasFiltros";
import Toast from "@/components/ui/Toast";
import Table, { TableColumn } from "@/components/ui/Table";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useRouter } from "next/navigation";
import { useTableSort } from "@/hooks/useTableSort";
import SortableHeader from "@/components/ui/SortableHeader";
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

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Vigente":
      case "Renovada": return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Próxima a Vencer": return "bg-orange-100 text-orange-800 border border-orange-200";
      case "Pendiente de Pago": return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Vencida": 
      case "Anulada": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // 🔥 NUEVA ESTRUCTURA DE COLUMNAS
  const columnas: TableColumn[] = [
    { label: <SortableHeader label="Nro Póliza" sortKey="nroPoliza" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: "Titular" },
    { label: "Compañía" },
    { label: <SortableHeader label="Rama / Cobertura" sortKey="tipoPoliza" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: "Detalle del Riesgo" }, // <-- COLUMNA NUEVA
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
            
            {/* Nro Póliza */}
            <td 
              className="px-6 py-4 font-mono font-medium text-green-700 cursor-pointer hover:underline hover:text-green-800"
              onClick={() => router.push(`/polizas/${poliza.id}`)}
              title="Ver detalle completo"
            >
              #{poliza.nroPoliza}
            </td>
            
            {/* Titular */}
            <td className="px-6 py-4">
              <div className="font-medium text-gray-900">{poliza.asegurado?.nombre} {poliza.asegurado?.apellido}</div>
              <div className="text-xs text-gray-500">DNI: {poliza.asegurado?.dni}</div>
            </td>
            
            {/* Compañía */}
            <td className="px-6 py-4 text-gray-700">{poliza.compania?.nombre || "-"}</td>
            
            {/* Rama / Cobertura */}
            <td className="px-6 py-4">
              <div className="font-medium text-gray-900">{poliza.tipoPoliza}</div>
              <div className="text-xs text-gray-500 truncate max-w-[150px]" title={poliza.cobertura}>
                {poliza.cobertura || "Sin detalle de cobertura"}
              </div>
            </td>

            {/* 🔥 NUEVA COLUMNA: Detalle del Riesgo */}
            <td className="px-6 py-4">
              {poliza.tipoPoliza === "Automotor" || poliza.tipoPoliza === "Motovehículo" ? (
                <>
                  <div className="font-medium text-gray-900">{poliza.patente ? poliza.patente.toUpperCase() : "-"}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[150px]">
                    {poliza.marca || poliza.modelo ? `${poliza.marca || ""} ${poliza.modelo || ""}`.trim() : "Sin marca/modelo"}
                  </div>
                </>
              ) : poliza.tipoPoliza === "Combinado Familiar" || poliza.tipoPoliza === "Integral de Comercio" ? (
                <div className="text-sm text-gray-900 truncate max-w-[200px]" title={poliza.ubicacionRiesgo}>
                  {poliza.ubicacionRiesgo || "-"}
                </div>
              ) : poliza.tipoPoliza === "ART" ? (
                <div className="text-sm text-gray-900">
                  {poliza.cantidadEmpleados ? `${poliza.cantidadEmpleados} Empleados` : "-"}
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic">-</div>
              )}
            </td>

            {/* Vigencia */}
            <td className="px-6 py-4">
              <div className="text-gray-900">{new Date(poliza.fechaInicio).toLocaleDateString("es-AR")}</div>
              <div className="text-xs text-gray-500">al {new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR")}</div>
            </td>
            
            {/* Estado */}
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${getEstadoBadge(getEstadoInteligente(poliza))}`}>
                {getEstadoInteligente(poliza)}
              </span>
            </td>
            
            {/* Acciones */}
            <td className="px-6 py-4 text-right relative">
              <ActionMenu isOpen={menuAbiertoId === poliza.id} onToggle={() => setMenuAbiertoId(menuAbiertoId === poliza.id ? null : poliza.id)}>
                <ActionMenuItem icon={Edit} label="Editar Póliza" onClick={() => { setPolizaAEditar(poliza); setMenuAbiertoId(null); setIsModalOpen(true); }} />
                
                {poliza.asegurado?.email && getEstadoInteligente(poliza) !== "Anulada" && (
                  <ActionMenuItem icon={Mail} label="Avisar Vencimiento" onClick={() => enviarAvisoVencimiento(poliza)} />
                )}
                
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