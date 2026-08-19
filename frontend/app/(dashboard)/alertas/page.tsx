"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, XOctagon, Search, List, LayoutGrid, Download, Mail, Loader2, Filter } from "lucide-react";
import dynamic from "next/dynamic";
import AlertaSection from "@/components/alertas/AlertaSection";
import Toast from "@/components/ui/Toast";
import { apiFetch } from "@/services/api"; 
import { useAuthStore } from "@/store/authStore";
import { PERMISOS, tienePermiso } from "@/utils/roles";

const ExportarExcelModal = dynamic(() => import("@/components/ui/ExportarExcelModal"), { ssr: false });

export default function AlertasPage() {
  const { user } = useAuthStore();
  const puedeModificar = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);

  const [data, setData] = useState<{ vencidas: any[]; criticas: any[]; proximas: any[]; config: { diasCritica: number; diasMax: number }; }>({
    vencidas: [], criticas: [], proximas: [], config: { diasCritica: 7, diasMax: 30 }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [vista, setVista] = useState<"lista" | "tarjetas">("lista");

  // 🔥 1. ESTADOS PARA FILTROS RÁPIDOS
  const [filtroRama, setFiltroRama] = useState("TODAS");
  const [filtroCompania, setFiltroCompania] = useState("TODAS");

  // 🔥 2. ESTADOS PARA ACCIONES MASIVAS
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  
  // 🔥 3. ESTADOS PARA EXPORTAR Y NOTIFICAR
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const fetchAlertas = async () => {
    try {
      const res = await apiFetch('/api/alertas');
      const resData = await res.json();
      if (resData && Array.isArray(resData.vencidas)) setData(resData);
    } catch (err) {
      console.error("Error al cargar alertas", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAlertas(); }, []);

  // Extraer valores únicos para los filtros (combinando todas las listas)
  const todasLasAlertas = [...data.vencidas, ...data.criticas, ...data.proximas];
  const ramasUnicas = Array.from(new Set(todasLasAlertas.map(p => p.tipoPoliza))).filter(Boolean);
  const companiasUnicas = Array.from(new Set(todasLasAlertas.map(p => p.compania?.nombre))).filter(Boolean);

  // Lógica de Filtrado (Texto + Selectores)
  const filtrarAlertas = (lista: any[]) => {
    return lista.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchSearch = !term || p.nroPoliza?.toLowerCase().includes(term) || `${p.asegurado?.nombre} ${p.asegurado?.apellido}`.toLowerCase().includes(term) || p.patente?.toLowerCase().includes(term);
      const matchRama = filtroRama === "TODAS" || p.tipoPoliza === filtroRama;
      const matchCompania = filtroCompania === "TODAS" || p.compania?.nombre === filtroCompania;
      
      return matchSearch && matchRama && matchCompania;
    });
  };

  // Función de Envío Masivo
  const enviarEmailsMasivos = async () => {
    if (selectedIds.length === 0 || !puedeModificar) return;
    setIsSendingBulk(true);

    const paraEnviar = todasLasAlertas.filter(p => selectedIds.includes(p.id) && p.asegurado?.email);

    if (paraEnviar.length === 0) {
      setToast({ show: true, msg: "Ninguna póliza seleccionada tiene un email válido." });
      setIsSendingBulk(false);
      return;
    }

    try {
      await Promise.all(
        paraEnviar.map(p => apiFetch(`/api/polizas/${p.id}/aviso`, { method: "POST" }))
      );
      setToast({ show: true, msg: `Se enviaron ${paraEnviar.length} recordatorios con éxito.` });
      setSelectedIds([]); // Limpiamos selección
      fetchAlertas(); // Recargamos para actualizar la fecha de "Último aviso"
    } catch (error) {
      setToast({ show: true, msg: "Hubo un error al enviar algunos correos." });
    } finally {
      setIsSendingBulk(false);
    }
  };

  // Preparar datos para Excel
  const prepararDatosExportacion = () => {
    const filtradas = [
      ...filtrarAlertas(data.vencidas).map(p => ({ ...p, Nivel: "Vencida" })),
      ...filtrarAlertas(data.criticas).map(p => ({ ...p, Nivel: "Crítica" })),
      ...filtrarAlertas(data.proximas).map(p => ({ ...p, Nivel: "Próxima" }))
    ];

    return filtradas.map(p => ({
      "Nivel Alerta": p.Nivel,
      "Asegurado": `${p.asegurado?.nombre || ""} ${p.asegurado?.apellido || ""}`.trim(),
      "DNI/CUIT": p.asegurado?.dni || "-",
      "Teléfono": p.asegurado?.telefono || "-",
      "Email": p.asegurado?.email || "-",
      "Compañía": p.compania?.nombre || "-",
      "Rama": p.tipoPoliza || "-",
      "Nro Póliza": p.nroPoliza || "-",
      "Patente": p.patente || "-",
      "Vencimiento": new Date(p.fechaVencimiento).toLocaleDateString("es-AR")
    }));
  };

  const toggleSelectAll = (ids: number[], isSelecting: boolean) => {
    if (isSelecting) {
      const nuevos = ids.filter(id => !selectedIds.includes(id));
      setSelectedIds([...selectedIds, ...nuevos]);
    } else {
      setSelectedIds(selectedIds.filter(id => !ids.includes(id)));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selId => selId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 dark:text-gray-400 animate-pulse transition-colors">Buscando vencimientos...</div>;

  return (
    <div className="flex flex-col p-4 sm:p-8 w-full gap-6 transition-colors duration-300">
      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 transition-colors">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Centro de Alertas</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 transition-colors">Monitoreá los vencimientos para no perder ninguna renovación.</p>
        </div>
        
        <div className="flex flex-col w-full xl:w-auto gap-3">
          
          {/* Fila 1: Botones de Acción Global */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 w-full">
            {puedeModificar && selectedIds.length > 0 && (
              <button 
                onClick={enviarEmailsMasivos}
                disabled={isSendingBulk}
                className="flex justify-center items-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isSendingBulk ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                Enviar {selectedIds.length} Mails
              </button>
            )}
            
            <button 
              onClick={() => {
                if(todasLasAlertas.length === 0) return alert("No hay datos para exportar.");
                setIsExportModalOpen(true);
              }} 
              className="flex justify-center items-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
            >
              <Download size={16} /> Exportar Reporte
            </button>
          </div>

          {/* Fila 2: Buscador, Filtros y Toggle Vista */}
          <div className="flex flex-col md:flex-row items-center gap-3 w-full">
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" placeholder="Buscar póliza..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm transition-colors shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-40">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select value={filtroRama} onChange={(e) => setFiltroRama(e.target.value)} className="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl outline-none text-sm cursor-pointer appearance-none shadow-sm transition-colors font-medium">
                  <option value="TODAS">Todas las Ramas</option>
                  {ramasUnicas.map(r => <option key={r as string} value={r as string}>{r as string}</option>)}
                </select>
              </div>

              <div className="relative flex-1 md:w-40">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select value={filtroCompania} onChange={(e) => setFiltroCompania(e.target.value)} className="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl outline-none text-sm cursor-pointer appearance-none shadow-sm transition-colors font-medium">
                  <option value="TODAS">Todas las Cías.</option>
                  {companiasUnicas.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-200 dark:border-gray-800 w-full md:w-auto transition-colors shrink-0">
              <button onClick={() => setVista("lista")} className={`flex-1 md:flex-none flex justify-center p-2 rounded-lg transition-all ${vista === "lista" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`} title="Vista de Lista"><List size={16} /></button>
              <button onClick={() => setVista("tarjetas")} className={`flex-1 md:flex-none flex justify-center p-2 rounded-lg transition-all ${vista === "tarjetas" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`} title="Vista de Tarjetas"><LayoutGrid size={16} /></button>
            </div>
          </div>

        </div>
      </div>

      <AlertaSection 
        titulo="Vencidas (Sin cobertura)" Icono={XOctagon} nivel="vencida" vista={vista}
        alertas={filtrarAlertas(data.vencidas)} mensajeVacio="Excelente, no tenés pólizas vencidas sin gestionar." 
        selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll}
      />
      <AlertaSection 
        titulo={`Críticas (0 a ${data.config.diasCritica} días)`} Icono={AlertTriangle} nivel="critica" vista={vista}
        alertas={filtrarAlertas(data.criticas)} mensajeVacio="No hay vencimientos críticos." 
        selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll}
      />
      <AlertaSection 
        titulo={`Próximas (${data.config.diasCritica + 1} a ${data.config.diasMax} días)`} Icono={Clock} nivel="proxima" vista={vista}
        alertas={filtrarAlertas(data.proximas)} mensajeVacio="No hay vencimientos próximos." 
        selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll}
      />

      <ExportarExcelModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} datos={prepararDatosExportacion()} nombreArchivo={`Reporte_Vencimientos_${new Date().toISOString().split("T")[0]}`} />
      <Toast message={toast.msg} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}