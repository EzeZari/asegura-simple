"use client";

import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, FileText, Trash2, Edit } from "lucide-react";
import NuevaPolizaModal from "@/components/polizas/NuevaPolizaModal";
import PolizasFiltros from "@/components/polizas/PolizasFiltros";
import Toast from "@/components/ui/Toast";
import Table, { TableColumn } from "@/components/ui/Table";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useRouter } from "next/navigation";

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

  // Estados para eliminación
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [polizaAEliminar, setPolizaAEliminar] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPolizas = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/polizas");
      const data = await res.json();
      setPolizas(data);
    } catch (error) {
      console.error("Error al cargar pólizas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPolizas(); }, []);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setPolizaAEditar(null);
    fetchPolizas(); 
    setMensajeToast("Póliza guardada con éxito");
    setShowToast(true);
  };

  const abrirParaEditar = (poliza: any) => {
    setPolizaAEditar(poliza);
    setMenuAbiertoId(null);
    setIsModalOpen(true);
  };

  const cambiarEstadoRapido = async (poliza: any, nuevoEstado: string) => {
    setMenuAbiertoId(null);
    try {
      const response = await fetch(`http://localhost:3001/api/polizas/${poliza.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...poliza, estado: nuevoEstado }),
      });
      if (!response.ok) throw new Error("Error al cambiar estado");
      fetchPolizas();
      setMensajeToast(`Estado cambiado a ${nuevoEstado}`);
      setShowToast(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al cambiar el estado.");
    }
  };

  // Función de eliminación
  const ejecutarEliminacion = async () => {
    if (!polizaAEliminar) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:3001/api/polizas/${polizaAEliminar.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchPolizas();
      setMensajeToast("Póliza eliminada correctamente");
      setShowToast(true);
      setIsConfirmOpen(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
      setPolizaAEliminar(null);
    }
  };

  const polizasFiltradas = polizas.filter((poliza) => {
    const busqueda = searchTerm.toLowerCase();
    const nroPoliza = poliza.nroPoliza.toLowerCase();
    const nombreCliente = `${poliza.asegurado?.nombre} ${poliza.asegurado?.apellido || ""}`.toLowerCase();
    
    const pasaFiltroTexto = nroPoliza.includes(busqueda) || nombreCliente.includes(busqueda);
    const pasaFiltroRama = filtroRama === "Todas" || poliza.tipoPoliza === filtroRama;
    const pasaFiltroEstado = filtroEstado === "Todos" || poliza.estado === filtroEstado;

    return pasaFiltroTexto && pasaFiltroRama && pasaFiltroEstado;
  });

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
    { label: "Nro Póliza" },
    { label: "Titular" },
    { label: "Compañía" },
    { label: "Rama / Cobertura" },
    { label: "Vigencia" },
    { label: "Estado" },
    { label: "Acciones", align: "right" },
  ];

  const estadoVacio = (
    <div className="flex flex-col items-center justify-center text-gray-500">
      <FileText size={32} className="text-gray-300 mb-3" />
      <p className="font-medium text-gray-900">No se encontraron pólizas</p>
      <p className="text-sm mt-1">Probá ajustando los filtros de búsqueda.</p>
    </div>
  );

return (
    <div className="flex flex-col p-8 w-full gap-8 bg-white min-h-screen overflow-x-hidden">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pólizas</h1>
          <p className="text-gray-500 mt-1">Gestioná las coberturas activas de tus clientes.</p>
        </div>
        <button 
          onClick={() => { setPolizaAEditar(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={20} /> Nueva Póliza
        </button>
      </div>

      <PolizasFiltros 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        filtroRama={filtroRama} setFiltroRama={setFiltroRama}
        filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado}
      />

      <Table 
        columns={columnas} 
        isLoading={isLoading} 
        isEmpty={polizasFiltradas.length === 0} 
        emptyContent={estadoVacio}
      >
        {polizasFiltradas.map((poliza) => (
          <tr key={poliza.id} className="hover:bg-gray-50/50 transition-colors group">
            {/* ACÁ ESTÁ EL CAMBIO: Hicimos el número clickeable */}
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
              <button 
                onClick={() => setMenuAbiertoId(menuAbiertoId === poliza.id ? null : poliza.id)}
                className="text-gray-400 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-lg"
              >
                <MoreHorizontal size={20} />
              </button>

              {menuAbiertoId === poliza.id && (
                <div className="absolute right-8 top-10 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                  <button 
                    onClick={() => abrirParaEditar(poliza)} 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit size={14} /> Editar Póliza
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  {poliza.estado !== "Vigente" && (
                    <button onClick={() => cambiarEstadoRapido(poliza, "Vigente")} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50">Marcar Vigente</button>
                  )}
                  {poliza.estado !== "Pendiente de Pago" && (
                    <button onClick={() => cambiarEstadoRapido(poliza, "Pendiente de Pago")} className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50">Marcar Pendiente</button>
                  )}
                  {poliza.estado !== "Anulada" && (
                    <button onClick={() => cambiarEstadoRapido(poliza, "Anulada")} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Anular Póliza</button>
                  )}
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button 
                    onClick={() => {
                      setPolizaAEliminar(poliza);
                      setMenuAbiertoId(null);
                      setIsConfirmOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Eliminar Póliza
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <NuevaPolizaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} polizaAEditar={polizaAEditar} />
      
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={ejecutarEliminacion}
        isLoading={isDeleting}
        title="¿Eliminar póliza?"
        message={`Esta acción eliminará la póliza #${polizaAEliminar?.nroPoliza} de forma permanente. No se puede deshacer.`}
      />

      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}