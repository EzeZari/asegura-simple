"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Search } from "lucide-react";
import NuevoSiniestroModal from "@/components/siniestros/NuevoSiniestroModal";
import SiniestroTableRow from "@/components/siniestros/SiniestroTableRow";
import Toast from "@/components/ui/Toast";
import Table, { TableColumn } from "@/components/ui/Table";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PageHeader from "@/components/ui/PageHeader";
import { useTableSort } from "@/hooks/useTableSort";
import SortableHeader from "@/components/ui/SortableHeader";
import SelectOrdenamiento from "@/components/ui/SelectOrdenamiento"; 

const OPCIONES_ORDEN = [
  { value: "mas_recientes", label: "Carga más reciente" },
  { value: "fecha_hecho_reciente", label: "Fecha del hecho (más reciente)" },
  { value: "fecha_hecho_antiguo", label: "Fecha del hecho (más antigua)" },
  { value: "alfabetico", label: "A-Z (Titular)" },
];

export default function SiniestrosPage() {
  const [siniestros, setSiniestros] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const [ordenActual, setOrdenActual] = useState("mas_recientes");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siniestroAEditar, setSiniestroAEditar] = useState<any>(null);
  
  const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [siniestroAEliminar, setSiniestroAEliminar] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");

  const fetchSiniestros = async () => {
    try {
      // 🔥 CORREGIDO (Backtick al final)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/siniestros`);
      setSiniestros(await res.json());
    } catch (error) { console.error("Error al cargar siniestros:", error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchSiniestros(); }, []);

  const ejecutarEliminacion = async () => {
    if (!siniestroAEliminar) return;
    setIsDeleting(true);
    try {
      // 🔥 CORREGIDO (Backtick al final)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/siniestros/${siniestroAEliminar.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      
      fetchSiniestros();
      setMensajeToast("Siniestro eliminado del sistema.");
      setShowToast(true);
      setIsConfirmOpen(false);
    } catch (error: any) { alert(error.message); } finally { setIsDeleting(false); setSiniestroAEliminar(null); }
  };

  let siniestrosFiltrados = siniestros.filter((s) => {
    const busqueda = searchTerm.toLowerCase();
    const cliente = `${s.poliza?.asegurado?.nombre} ${s.poliza?.asegurado?.apellido || ""}`.toLowerCase();
    
    const matchBusqueda = s.nroSiniestro.toLowerCase().includes(busqueda) || 
                          cliente.includes(busqueda) || 
                          (s.poliza?.patente && s.poliza.patente.toLowerCase().includes(busqueda));
    const matchEstado = filtroEstado === "Todos" || s.estadoSiniestro === filtroEstado;
    
    return matchBusqueda && matchEstado;
  });

  siniestrosFiltrados = siniestrosFiltrados.sort((a, b) => {
    switch (ordenActual) {
      case "mas_recientes": 
        return b.id - a.id;
      case "fecha_hecho_reciente": 
        return new Date(b.fechaHecho).getTime() - new Date(a.fechaHecho).getTime();
      case "fecha_hecho_antiguo":
        return new Date(a.fechaHecho).getTime() - new Date(b.fechaHecho).getTime();
      case "alfabetico":
        const nombreA = `${a.poliza?.asegurado?.nombre} ${a.poliza?.asegurado?.apellido || ""}`.toLowerCase().trim();
        const nombreB = `${b.poliza?.asegurado?.nombre} ${b.poliza?.asegurado?.apellido || ""}`.toLowerCase().trim();
        return nombreA.localeCompare(nombreB);
      default:
        return 0;
    }
  });

  const { items: siniestrosOrdenados, requestSort, sortConfig } = useTableSort(siniestrosFiltrados);

  const columnas: TableColumn[] = [
    { label: <SortableHeader label="Nro / Fecha" sortKey="nroSiniestro" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: "Titular / DNI" },
    { label: "Nro Póliza" },
    { label: "Patente / Riesgo" },
    { label: "Descripción Breve" },
    { label: <SortableHeader label="Estado del Trámite" sortKey="estadoSiniestro" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: "Acciones", align: "right" },
  ];

  return (
    <div className="flex flex-col p-8 w-full gap-8 bg-white min-h-screen">
      
      <PageHeader 
        titulo="Gestión de Siniestros" 
        descripcion="Seguimiento de reclamos, choques y eventos de tus clientes." 
        textoBoton="Reportar Siniestro" 
        onNuevo={() => { setSiniestroAEditar(null); setIsModalOpen(true); }} 
      />

      <div className="flex flex-col md:flex-row gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" placeholder="Buscar por patente, cliente o nro reclamo..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium"
          />
        </div>
        <select 
          value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white font-bold text-gray-700"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Denuncia Pendiente">Pendientes</option>
          <option value="En Análisis">En Análisis</option>
          <option value="Aprobado">Aprobados</option>
          <option value="Pagado">Pagados</option>
          <option value="Rechazado">Rechazados</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full -mb-4">
        <div className="w-full md:w-auto">
          <SelectOrdenamiento 
            opciones={OPCIONES_ORDEN}
            valorActual={ordenActual}
            onChange={setOrdenActual}
          />
        </div>
      </div>

      <Table columns={columnas} isLoading={isLoading} isEmpty={siniestrosOrdenados.length === 0} emptyContent={
        <div className="flex flex-col items-center justify-center text-gray-500 py-10">
          <AlertTriangle size={40} className="text-gray-300 mb-4" />
          <p className="font-medium text-gray-900 text-lg">No se encontraron siniestros</p>
          <p className="text-sm">Tranquilidad pura. Tus clientes están a salvo.</p>
        </div>
      }>
        {siniestrosOrdenados.map((siniestro) => (
          <SiniestroTableRow 
            key={siniestro.id}
            siniestro={siniestro}
            menuAbiertoId={menuAbiertoId}
            onToggleMenu={setMenuAbiertoId}
            onEdit={(s) => { setSiniestroAEditar(s); setMenuAbiertoId(null); setIsModalOpen(true); }}
            onEliminar={(s) => { setSiniestroAEliminar(s); setMenuAbiertoId(null); setIsConfirmOpen(true); }}
          />
        ))}
      </Table>

      <NuevoSiniestroModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => { setIsModalOpen(false); fetchSiniestros(); setShowToast(true); setMensajeToast("Ficha de siniestro actualizada"); }} 
        siniestroAEditar={siniestroAEditar} 
      />
      
      <ConfirmModal 
        isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={ejecutarEliminacion} 
        isLoading={isDeleting} title="¿Eliminar siniestro?" 
        message={`Vas a borrar el registro del siniestro #${siniestroAEliminar?.nroSiniestro}. Esta acción no se puede deshacer.`} 
      />
      
      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}