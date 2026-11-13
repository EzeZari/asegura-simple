"use client";

import { useState, useEffect } from "react";
// 🔥 Agregamos Info, X, CheckCircle2 y Mail para el modal de ayuda
import { AlertTriangle, Search, Info, X, LayoutList, CheckCircle2, Mail } from "lucide-react";
import NuevoSiniestroModal from "@/components/siniestros/NuevoSiniestroModal";
import SiniestroTableRow from "@/components/siniestros/SiniestroTableRow";
import SiniestroMobileCard from "@/components/siniestros/SiniestroMobileCard"; 
import Toast from "@/components/ui/Toast";
import Table, { TableColumn } from "@/components/ui/Table";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal"; 
import PageHeader from "@/components/ui/PageHeader";
import { useTableSort } from "@/hooks/useTableSort";
import SortableHeader from "@/components/ui/SortableHeader";
import SelectOrdenamiento from "@/components/ui/SelectOrdenamiento"; 
import { useAuthStore } from "@/store/authStore"; 
import { apiFetch } from "@/services/api"; 
import { PERMISOS, tienePermiso } from "@/utils/roles"; 

import TutorialTourSiniestros from "@/components/ui/tours/TutorialTourSiniestros";

const OPCIONES_ORDEN = [
  { value: "mas_recientes", label: "Carga más reciente" },
  { value: "fecha_hecho_reciente", label: "Fecha del hecho (más reciente)" },
  { value: "fecha_hecho_antiguo", label: "Fecha del hecho (más antigua)" },
  { value: "alfabetico", label: "A-Z (Titular)" },
];

export default function SiniestrosPage() {
  const { user } = useAuthStore();
  const puedeModificar = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);

  const [siniestros, setSiniestros] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔥 Estado para el modal de ayuda rápida
  const [showInstrucciones, setShowInstrucciones] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [ordenActual, setOrdenActual] = useState("mas_recientes");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siniestroAEditar, setSiniestroAEditar] = useState<any>(null);
  
  const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [siniestroAEliminar, setSiniestroAEliminar] = useState<any>(null);
  const [isDeleting, setIsLoadingDeleting] = useState(false);

  const [errorModalMsg, setErrorModalMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");

  const fetchSiniestros = async () => {
    try {
      const res = await apiFetch('/api/siniestros');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setSiniestros(data);
      } else {
        setSiniestros([]); 
      }
    } catch (error) { 
      setSiniestros([]); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchSiniestros(); }, []);

  const ejecutarEliminacion = async () => {
    if (!siniestroAEliminar) return;
    setIsLoadingDeleting(true);
    try {
      const res = await apiFetch(`/api/siniestros/${siniestroAEliminar.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      
      fetchSiniestros();
      setMensajeToast("Siniestro eliminado del sistema.");
      setShowToast(true);
      setIsConfirmOpen(false);
    } catch (error: any) { 
      setIsConfirmOpen(false);
      setErrorModalMsg(error.message || "Ocurrió un error al intentar eliminar el siniestro. Verificá tus permisos."); 
    } finally { 
      setIsLoadingDeleting(false); 
      setSiniestroAEliminar(null); 
    }
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

  const columnasBase: TableColumn[] = [
    { label: <SortableHeader label="Nro / Fecha" sortKey="nroSiniestro" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: "Titular / DNI" },
    { label: "Nro Póliza" },
    { label: "Patente / Riesgo" },
    { label: "Descripción Breve" },
    { label: <SortableHeader label="Estado del Trámite" sortKey="estadoSiniestro" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
  ];

  const columnas = puedeModificar 
    ? [...columnasBase, { label: "Acciones", align: "right" as const }]
    : columnasBase;

  return (
    <div className="flex flex-col p-4 lg:p-8 w-full gap-5 lg:gap-8 min-h-screen overflow-x-hidden transition-colors duration-300">
      
      <TutorialTourSiniestros />

      <div className="tour-siniestros-header">
        <PageHeader 
          titulo="Gestión de Siniestros" 
          descripcion="Seguimiento de reclamos, choques y eventos de tus clientes." 
          textoBoton={puedeModificar ? "Reportar Siniestro" : ""}
          onNuevo={puedeModificar ? () => { setSiniestroAEditar(null); setIsModalOpen(true); } : undefined} 
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-gray-50/50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 tour-siniestros-filtros transition-colors">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input 
            type="text" placeholder="Buscar por patente, cliente o nro reclamo..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 lg:py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium text-sm lg:text-base transition-colors"
          />
        </div>
        <select 
          value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
          className="w-full md:w-64 px-4 py-2.5 lg:py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-transparent font-bold text-gray-700 dark:text-gray-200 text-sm lg:text-base cursor-pointer transition-colors"
        >
          <option value="Todos" className="dark:bg-gray-800">Todos los estados</option>
          <option value="Denuncia Pendiente" className="dark:bg-gray-800">Pendientes</option>
          <option value="En Análisis" className="dark:bg-gray-800">En Análisis</option>
          <option value="Aprobado" className="dark:bg-gray-800">Aprobados</option>
          <option value="Pagado" className="dark:bg-gray-800">Pagados</option>
          <option value="Rechazado" className="dark:bg-gray-800">Rechazados</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full -mb-2 lg:-mb-4">
        <div className="w-full md:w-auto">
          <SelectOrdenamiento opciones={OPCIONES_ORDEN} valorActual={ordenActual} onChange={setOrdenActual} />
        </div>
        
        {/* 🔥 Botón de información adaptado de alertas */}
        <button 
          onClick={() => setShowInstrucciones(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors sm:ml-auto w-full sm:w-auto justify-center"
        >
          <Info size={16} /> 
        </button>
      </div>

      <div className="tour-siniestros-tabla w-full">
        {/* 🔥 VISTA ESCRITORIO Y TABLET */}
        <div className="hidden md:block">
          <Table columns={columnas} isLoading={isLoading} isEmpty={siniestrosOrdenados.length === 0} emptyContent={
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 py-10 transition-colors">
              <AlertTriangle size={40} className="text-gray-300 dark:text-gray-600 mb-4" />
              <p className="font-medium text-gray-900 dark:text-white text-lg">No se encontraron siniestros</p>
              <p className="text-sm">Tranquilidad pura. Tus clientes están a salvo.</p>
            </div>
          }>
            {siniestrosOrdenados.map((siniestro) => (
              <SiniestroTableRow 
                key={siniestro.id}
                siniestro={siniestro}
                menuAbiertoId={menuAbiertoId}
                onToggleMenu={setMenuAbiertoId}
                puedeModificar={puedeModificar} 
                onEdit={puedeModificar ? (s) => { setSiniestroAEditar(s); setMenuAbiertoId(null); setIsModalOpen(true); } : undefined}
                onEliminar={puedeModificar ? (s) => { setSiniestroAEliminar(s); setMenuAbiertoId(null); setIsConfirmOpen(true); } : undefined}
              />
            ))}
          </Table>
        </div>

        {/* 🔥 VISTA CELULAR: Tarjetas */}
        <div className="block md:hidden">
          {isLoading ? (
             <div className="text-center py-8 text-gray-500 animate-pulse">Cargando siniestros...</div>
          ) : siniestrosOrdenados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <AlertTriangle size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
              <p className="font-medium text-gray-900 dark:text-white text-lg">No hay siniestros</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-12">
              {siniestrosOrdenados.map((siniestro) => (
                <SiniestroMobileCard 
                  key={siniestro.id}
                  siniestro={siniestro}
                  menuAbiertoId={menuAbiertoId}
                  onToggleMenu={setMenuAbiertoId}
                  puedeModificar={puedeModificar} 
                  onEdit={puedeModificar ? (s) => { setSiniestroAEditar(s); setMenuAbiertoId(null); setIsModalOpen(true); } : undefined}
                  onEliminar={puedeModificar ? (s) => { setSiniestroAEliminar(s); setMenuAbiertoId(null); setIsConfirmOpen(true); } : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {puedeModificar && (
        <>
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
        </>
      )}
      
      {/* 🔥 MODAL DE INSTRUCCIONES ESTILO ALERTAS */}
      {showInstrucciones && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-xl relative animate-in fade-in zoom-in duration-200 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowInstrucciones(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><X size={20} /></button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0"><Info size={24} /></div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">¿Cómo funciona Gestión de Siniestros?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Guía rápida paso a paso para el seguimiento de reclamos.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-xs border border-orange-200 dark:border-orange-800/50">1</div>
                  Reportá el Hecho
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-7">
                  Usá el botón "Reportar Siniestro" arriba a la derecha. Vas a poder cargar la descripción del evento y asociarlo rápidamente a cualquier póliza vigente de tu cartera.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs border border-blue-200 dark:border-blue-800/50">2</div>
                  Llevá el Expediente
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-7">
                  Una vez creado, entrá a <b>"Ver Expediente"</b> en la columna de Acciones (ícono de ojito). Ahí podés cargar notas privadas (peritaje, documentación faltante) y actualizar el estado general del trámite.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center font-black text-xs border border-green-200 dark:border-green-800/50">3</div>
                  Compartí el Enlace
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-7">
                  Dentro del expediente, tenés una tarjeta para generar un <b>link público</b>. Enviaselo al cliente por WhatsApp para que él mismo vea en tiempo real cómo avanza su caso sin tener que consultarte.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center font-black text-xs border border-gray-300 dark:border-gray-600">4</div>
                  Cerrá el Caso
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-7">
                  Cuando la compañía pague o rechace el siniestro, actualizá el estado final a <b>Cerrado</b> para mantener tu métrica de siniestralidad activa real y limpia.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={() => setShowInstrucciones(false)} className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 rounded-xl font-bold transition-all text-sm active:scale-95">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={!!errorModalMsg}
        onClose={() => setErrorModalMsg("")}
        title="Operación Denegada"
        message={errorModalMsg}
      />

      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}