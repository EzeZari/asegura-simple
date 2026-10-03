"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, XOctagon, Download, Mail, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import AlertaSection from "@/components/alertas/AlertaSection";
import AlertaCalendar from "@/components/alertas/AlertaCalendar";
import AlertasFiltros from "@/components/alertas/AlertasFiltros"; // 🔥 IMPORTAMOS EL COMPONENTE
import Toast from "@/components/ui/Toast";
import { apiFetch } from "@/services/api"; 
import { useAuthStore } from "@/store/authStore";
import { PERMISOS, tienePermiso } from "@/utils/roles";

const ExportarExcelModal = dynamic(() => import("@/components/ui/ExportarExcelModal"), { ssr: false });

export default function AlertasPage() {
  const { user } = useAuthStore();
  const accessToken = useAuthStore((state) => state.accessToken); 
  const puedeModificar = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);

  const [data, setData] = useState<{ vencidas: any[]; criticas: any[]; proximas: any[]; config: { diasCritica: number; diasMax: number }; }>({
    vencidas: [], criticas: [], proximas: [], config: { diasCritica: 7, diasMax: 30 }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [vista, setVista] = useState<"lista" | "tarjetas" | "calendario">("lista");
  const [filtroRama, setFiltroRama] = useState("TODAS");
  const [filtroCompania, setFiltroCompania] = useState("TODAS");
  const [filtroGestion, setFiltroGestion] = useState("PENDIENTES");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const [plantillas, setPlantillas] = useState({
    proxima: "Hola [Nombre], te avisamos que tu póliza de [Rama] ([NroPoliza]) en [Compania] vence el próximo [Vencimiento]. ¿Avanzamos con la renovación?",
    critica: "Hola [Nombre], te recuerdo que tu póliza de [Rama] ([NroPoliza]) vence en unos días ([Vencimiento]). Avisame así la renovamos a tiempo.",
    vencida: "Hola [Nombre], te escribo urgente porque tu póliza de [Rama] ([NroPoliza]) venció el [Vencimiento]. Avisame si la renovamos para no dejarte sin cobertura."
  });

  useEffect(() => {
    const vistaGuardada = localStorage.getItem("asegurasimple_vista_alertas");
    if (vistaGuardada === "lista" || vistaGuardada === "tarjetas" || vistaGuardada === "calendario") {
      setVista(vistaGuardada);
    }
  }, []);

  const cambiarVista = (nuevaVista: "lista" | "tarjetas" | "calendario") => {
    setVista(nuevaVista);
    localStorage.setItem("asegurasimple_vista_alertas", nuevaVista);
  };

  const cargarAlertas = async () => {
    try {
      const res = await apiFetch('/api/alertas', { cache: 'no-store' });
      const resData = await res.json();
      if (resData && Array.isArray(resData.vencidas)) setData(resData);
    } catch (err) {
      console.error("Error al cargar alertas", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return; 

    cargarAlertas();

    apiFetch('/api/agencia', { cache: 'no-store' })
      .then((res) => res.json())
      .then((configData) => {
        if (configData) {
          setPlantillas((prev) => ({
            proxima: configData.mensajeVencimiento || prev.proxima,
            critica: configData.mensajePolizaCritica || prev.critica,
            vencida: configData.mensajePolizaVencida || prev.vencida
          }));
        }
      })
      .catch((err) => console.error("Error al cargar la plantilla:", err));

  }, [accessToken]); 

  const todasLasAlertas = [...data.vencidas, ...data.criticas, ...data.proximas];
  // 🔥 Mantenemos dinámicas solo a las compañías, porque esas dependen de las que tengas cargadas
  const companiasUnicas = Array.from(new Set(todasLasAlertas.map(p => p.compania?.nombre))).filter(Boolean);

  const filtrarAlertas = (lista: any[]) => {
    return lista.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchSearch = !term || p.nroPoliza?.toLowerCase().includes(term) || `${p.asegurado?.nombre} ${p.asegurado?.apellido}`.toLowerCase().includes(term) || p.patente?.toLowerCase().includes(term);
      const matchRama = filtroRama === "TODAS" || p.tipoPoliza === filtroRama;
      const matchCompania = filtroCompania === "TODAS" || p.compania?.nombre === filtroCompania;
      
      const matchGestion = filtroGestion === "TODAS" ? true :
                           filtroGestion === "PENDIENTES" ? !p.avisoGestionado :
                           p.avisoGestionado;
      
      return matchSearch && matchRama && matchCompania && matchGestion;
    });
  };

  const todasLasAlertasFiltradas = filtrarAlertas(todasLasAlertas);

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
      setSelectedIds([]); 
      cargarAlertas(); 
    } catch (error) {
      setToast({ show: true, msg: "Hubo un error al enviar algunos correos." });
    } finally {
      setIsSendingBulk(false);
    }
  };

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
          
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 w-full">
            {puedeModificar && selectedIds.length > 0 && vista !== "calendario" && (
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

          {/* 🔥 INYECTAMOS EL COMPONENTE DE FILTROS ACÁ */}
          <AlertasFiltros 
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            filtroGestion={filtroGestion} setFiltroGestion={setFiltroGestion}
            filtroRama={filtroRama} setFiltroRama={setFiltroRama}
            filtroCompania={filtroCompania} setFiltroCompania={setFiltroCompania}
            companiasUnicas={companiasUnicas as string[]}
            vista={vista} cambiarVista={cambiarVista}
          />

        </div>
      </div>

      {vista === "calendario" ? (
        <AlertaCalendar alertas={todasLasAlertasFiltradas} />
      ) : (
        <>
          <AlertaSection 
            titulo="Vencidas (Sin cobertura)" Icono={XOctagon} nivel="vencida" vista={vista}
            alertas={filtrarAlertas(data.vencidas)} mensajeVacio={filtroGestion === "PENDIENTES" ? "¡Excelente! No te quedó ninguna póliza vencida sin gestionar." : "No hay pólizas vencidas en esta categoría."} 
            selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll}
            plantillas={plantillas} 
          />
          <AlertaSection 
            titulo={`Críticas (0 a ${data.config.diasCritica} días)`} Icono={AlertTriangle} nivel="critica" vista={vista}
            alertas={filtrarAlertas(data.criticas)} mensajeVacio={filtroGestion === "PENDIENTES" ? "Todo al día por acá. Sin vencimientos críticos pendientes." : "No hay vencimientos críticos."} 
            selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll}
            plantillas={plantillas} 
          />
          <AlertaSection 
            titulo={`Próximas (${data.config.diasCritica + 1} a ${data.config.diasMax} días)`} Icono={Clock} nivel="proxima" vista={vista}
            alertas={filtrarAlertas(data.proximas)} mensajeVacio="No tenés vencimientos próximos a la vista." 
            selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll}
            plantillas={plantillas} 
          />
        </>
      )}

      <ExportarExcelModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} datos={prepararDatosExportacion()} nombreArchivo={`Reporte_Vencimientos_${new Date().toISOString().split("T")[0]}`} />
      <Toast message={toast.msg} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}