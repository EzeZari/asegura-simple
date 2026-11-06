"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, XOctagon, Download, Mail, Loader2, CalendarDays, Wallet, Info, X, CheckCircle2, LayoutList } from "lucide-react";
import dynamic from "next/dynamic";
import AlertaSection from "@/components/alertas/AlertaSection";
import AlertaCalendar from "@/components/alertas/AlertaCalendar";
import AlertasFiltros from "@/components/alertas/AlertasFiltros";
import Toast from "@/components/ui/Toast";
import { apiFetch } from "@/services/api"; 
import { useAuthStore } from "@/store/authStore";
import { PERMISOS, tienePermiso } from "@/utils/roles";

const ExportarExcelModal = dynamic(() => import("@/components/ui/ExportarExcelModal"), { ssr: false });

export default function AlertasPage() {
  const { user } = useAuthStore();
  const accessToken = useAuthStore((state) => state.accessToken); 
  const puedeModificar = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);

  const [data, setData] = useState<{ 
    vencidas: any[]; criticas: any[]; proximas: any[]; 
    cobranzas: { vencidas: any[]; criticas: any[]; proximas: any[] };
    config: { diasCritica: number; diasMax: number }; 
  }>({
    vencidas: [], criticas: [], proximas: [], 
    cobranzas: { vencidas: [], criticas: [], proximas: [] },
    config: { diasCritica: 7, diasMax: 30 }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [tipoAlertaActiva, setTipoAlertaActiva] = useState<"RENOVACION" | "COBRANZA">("RENOVACION");
  const [vista, setVista] = useState<"lista" | "tarjetas" | "calendario">("lista");
  const [filtroGestion, setFiltroGestion] = useState("PENDIENTES");

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRama, setFiltroRama] = useState("TODAS");
  const [filtroCompania, setFiltroCompania] = useState("TODAS");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const [showInstrucciones, setShowInstrucciones] = useState(false);

  // 🔥 AGREGADA LA PLANTILLA DE COBRANZA
  const [plantillas, setPlantillas] = useState({
    proxima: "Hola [Nombre], te avisamos que tu póliza de [Rama] ([NroPoliza]) en [Compania] vence el próximo [Vencimiento]. ¿Avanzamos con la renovación?",
    critica: "Hola [Nombre], te recuerdo que tu póliza de [Rama] ([NroPoliza]) vence en unos días ([Vencimiento]). Avisame así la renovamos a tiempo.",
    vencida: "Hola [Nombre], te escribo urgente porque tu póliza de [Rama] ([NroPoliza]) venció el [Vencimiento]. Avisame si la renovamos para no dejarte sin cobertura.",
    cobranza: "Hola [Nombre], te escribimos porque registramos un atraso en el pago de tu cuota de [Rama] ([NroPoliza]). Por favor regularizá el saldo para evitar perder la cobertura."
  });

  useEffect(() => {
    const vistaGuardada = localStorage.getItem("asegurasimple_vista_alertas");
    if (vistaGuardada === "lista" || vistaGuardada === "tarjetas" || vistaGuardada === "calendario") {
      setVista(vistaGuardada);
    }

    const gestionGuardada = localStorage.getItem("asegurasimple_filtro_gestion");
    if (gestionGuardada === "PENDIENTES" || gestionGuardada === "GESTIONADAS" || gestionGuardada === "TODAS") {
      setFiltroGestion(gestionGuardada);
    }

    const tipoAlertaGuardado = localStorage.getItem("asegurasimple_tipo_alerta");
    if (tipoAlertaGuardado === "RENOVACION" || tipoAlertaGuardado === "COBRANZA") {
      setTipoAlertaActiva(tipoAlertaGuardado);
    }
  }, []);

  const cambiarVista = (nuevaVista: "lista" | "tarjetas" | "calendario") => {
    setVista(nuevaVista);
    localStorage.setItem("asegurasimple_vista_alertas", nuevaVista);
  };

  const cambiarFiltroGestion = (nuevoFiltro: string) => {
    setFiltroGestion(nuevoFiltro);
    localStorage.setItem("asegurasimple_filtro_gestion", nuevoFiltro);
  };

  const cambiarTipoAlerta = (nuevoTipo: "RENOVACION" | "COBRANZA") => {
    setTipoAlertaActiva(nuevoTipo);
    setSelectedIds([]); 
    localStorage.setItem("asegurasimple_tipo_alerta", nuevoTipo);
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
            vencida: configData.mensajePolizaVencida || prev.vencida,
            cobranza: configData.mensajeCobranza || prev.cobranza // 🔥 CARGAMOS DESDE BD
          }));
        }
      })
      .catch((err) => console.error("Error al cargar la plantilla:", err));

  }, [accessToken]); 

  const alertasActuales = tipoAlertaActiva === "RENOVACION" 
    ? [...data.vencidas, ...data.criticas, ...data.proximas]
    : [...data.cobranzas.vencidas, ...data.cobranzas.criticas, ...data.cobranzas.proximas];

  const companiasUnicas = Array.from(new Set(alertasActuales.map(p => p.compania?.nombre))).filter(Boolean);

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

  const todasLasAlertasFiltradas = filtrarAlertas(alertasActuales);

  const enviarEmailsMasivos = async () => {
    if (selectedIds.length === 0 || !puedeModificar) return;
    setIsSendingBulk(true);

    const paraEnviar = alertasActuales.filter(p => selectedIds.includes(p.id) && p.asegurado?.email);

    if (paraEnviar.length === 0) {
      setToast({ show: true, msg: "Ninguna póliza seleccionada tiene un email válido." });
      setIsSendingBulk(false);
      return;
    }

    try {
      await Promise.all(
        paraEnviar.map(p => apiFetch(`/api/polizas/${p.id}/aviso`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: tipoAlertaActiva })
        }))
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
    let baseVencidas = tipoAlertaActiva === "RENOVACION" ? data.vencidas : data.cobranzas.vencidas;
    let baseCriticas = tipoAlertaActiva === "RENOVACION" ? data.criticas : data.cobranzas.criticas;
    let baseProximas = tipoAlertaActiva === "RENOVACION" ? data.proximas : data.cobranzas.proximas;

    const filtradas = [
      ...filtrarAlertas(baseVencidas).map(p => ({ ...p, Nivel: "Vencida" })),
      ...filtrarAlertas(baseCriticas).map(p => ({ ...p, Nivel: "Crítica" })),
      ...filtrarAlertas(baseProximas).map(p => ({ ...p, Nivel: "Próxima" }))
    ];

    return filtradas.map(p => ({
      "Tipo de Alerta": tipoAlertaActiva === "RENOVACION" ? "Vigencia de Contrato" : "Refacturación (Cuota)",
      "Nivel Alerta": p.Nivel,
      "Asegurado": `${p.asegurado?.nombre || ""} ${p.asegurado?.apellido || ""}`.trim(),
      "DNI/CUIT": p.asegurado?.dni || "-",
      "Teléfono": p.asegurado?.telefono || "-",
      "Email": p.asegurado?.email || "-",
      "Compañía": p.compania?.nombre || "-",
      "Rama": p.tipoPoliza || "-",
      "Nro Póliza": p.nroPoliza || "-",
      "Patente": p.patente || "-",
      "Vencimiento": tipoAlertaActiva === "RENOVACION" 
                     ? new Date(p.fechaVencimiento).toLocaleDateString("es-AR")
                     : new Date(p.cuotaAlarma.fechaVencimiento).toLocaleDateString("es-AR")
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
    <div className="flex flex-col p-4 sm:p-8 w-full gap-6 transition-colors duration-300 relative">
      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 transition-colors">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Centro de Alertas</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 transition-colors">Monitoreá los vencimientos para no perder ninguna renovación ni cobranza.</p>
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
                if(alertasActuales.length === 0) return alert("No hay datos para exportar.");
                setIsExportModalOpen(true);
              }} 
              className="flex justify-center items-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
            >
              <Download size={16} /> Exportar Reporte
            </button>
          </div>

          <AlertasFiltros 
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            filtroGestion={filtroGestion} setFiltroGestion={cambiarFiltroGestion} 
            filtroRama={filtroRama} setFiltroRama={setFiltroRama}
            filtroCompania={filtroCompania} setFiltroCompania={setFiltroCompania}
            companiasUnicas={companiasUnicas as string[]}
            vista={vista} cambiarVista={cambiarVista}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-2 gap-4">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl w-full sm:w-fit">
          <button
            onClick={() => cambiarTipoAlerta("RENOVACION")} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              tipoAlertaActiva === "RENOVACION"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <CalendarDays size={18} /> Renovaciones
          </button>
          <button
            onClick={() => cambiarTipoAlerta("COBRANZA")} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              tipoAlertaActiva === "COBRANZA"
                ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Wallet size={18} /> Cobranzas
          </button>
        </div>

        <button 
          onClick={() => setShowInstrucciones(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors sm:ml-auto w-full sm:w-auto justify-center"
        >
          <Info size={16} /> 
        </button>
      </div>

      {vista === "calendario" ? (
        <AlertaCalendar alertas={todasLasAlertasFiltradas} tipoAlerta={tipoAlertaActiva} />
      ) : (
        <>
          <AlertaSection 
            titulo={tipoAlertaActiva === "RENOVACION" ? "Vencidas (Sin cobertura)" : "Cuotas Vencidas (Morosos)"}
            Icono={XOctagon} nivel="vencida" vista={vista}
            alertas={filtrarAlertas(tipoAlertaActiva === "RENOVACION" ? data.vencidas : data.cobranzas.vencidas)} 
            mensajeVacio={filtroGestion === "PENDIENTES" ? "¡Excelente! No te quedó ninguna póliza vencida sin gestionar." : "No hay pólizas vencidas en esta categoría."} 
            selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll}
            plantillas={plantillas} 
            tipoAlerta={tipoAlertaActiva}
            onUpdate={cargarAlertas}
          />
          <AlertaSection 
            titulo={tipoAlertaActiva === "RENOVACION" ? `Críticas (0 a ${data.config.diasCritica} días)` : "Esta semana (Urgentes)"} 
            Icono={AlertTriangle} nivel="critica" vista={vista}
            alertas={filtrarAlertas(tipoAlertaActiva === "RENOVACION" ? data.criticas : data.cobranzas.criticas)} 
            mensajeVacio={filtroGestion === "PENDIENTES" ? "Todo al día por acá. Sin vencimientos críticos pendientes." : "No hay vencimientos críticos."} 
            selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll}
            plantillas={plantillas} 
            tipoAlerta={tipoAlertaActiva}
            onUpdate={cargarAlertas}
          />
          <AlertaSection 
            titulo={tipoAlertaActiva === "RENOVACION" ? `Próximas (${data.config.diasCritica + 1} a ${data.config.diasMax} días)` : "Próximas semanas"} 
            Icono={Clock} nivel="proxima" vista={vista}
            alertas={filtrarAlertas(tipoAlertaActiva === "RENOVACION" ? data.proximas : data.cobranzas.proximas)} 
            mensajeVacio="No tenés vencimientos próximos a la vista." 
            selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll}
            plantillas={plantillas} 
            tipoAlerta={tipoAlertaActiva}
            onUpdate={cargarAlertas}
          />
        </>
      )}

      {showInstrucciones && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-xl relative animate-in fade-in zoom-in duration-200 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowInstrucciones(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><X size={20} /></button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0"><Info size={24} /></div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">¿Cómo funciona la sección Alertas?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Guía rápida para dominar tu centro de alertas.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm"><LayoutList size={18} className="text-indigo-500"/> 1. El Radar Bimodal (Las Pestañas)</h3>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2 ml-7">
                  <li><strong className="text-blue-600 dark:text-blue-400">Renovaciones:</strong> Lee la fecha de vencimiento del contrato. Ideal para saber qué pólizas hay que renovar en la compañía.</li>
                  <li><strong className="text-emerald-600 dark:text-emerald-400">Cobranzas:</strong> Lee el control de pagos. Te avisa exclusivamente cuando un cliente tiene que pagar su cuota del mes.</li>
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm"><AlertTriangle size={18} className="text-amber-500"/> 2. Niveles de Urgencia</h3>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2 ml-7">
                  <li><strong className="text-rose-600 dark:text-rose-400">Rojo (Vencidas):</strong> La fecha ya pasó. El cliente no tiene cobertura (Renovación) o está en mora (Cobranza).</li>
                  <li><strong className="text-orange-600 dark:text-orange-400">Naranja (Críticas):</strong> Vencen en los próximos {data.config.diasCritica} días.</li>
                  <li><strong className="text-amber-600 dark:text-amber-500">Amarillo (Próximas):</strong> Vencen a partir de los {data.config.diasCritica + 1} días y hasta los próximos {data.config.diasMax} días.</li>
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm"><CheckCircle2 size={18} className="text-emerald-500"/> 3. Gestión y Limpieza</h3>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2 ml-7">
                  <li><strong>Ocultar temporalmente:</strong> Si ya le avisaste al cliente, tildá <i>"Ya contactado"</i> en la fila de la lista. Se moverá mágicamente al filtro superior de <b>"Gestionadas"</b>.</li>
                  <li><strong>Añadir notas:</strong> Hacé clic en "+ Añadir nota" en cualquier alerta para recordar qué te respondió.</li>
                  <li><strong>Limpieza (Cobranzas):</strong> Entrá a la póliza, bajá al Seguimiento y <b>tildá el mes como pagado</b>.</li>
                  <li><strong>Limpieza (Renovaciones):</strong> Entrá a la póliza y hacé clic en el botón verde de <b>"Renovar"</b>.</li>
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm"><Mail size={18} className="text-blue-500"/> 4. Herramientas Rápidas</h3>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2 ml-7">
                  <li><strong>Avisos Masivos:</strong> Tildá las casillas cuadradas de la izquierda y usá el botón <i>"Enviar Mails"</i>.</li>
                  <li><strong>Botón de WhatsApp:</strong> Abre WhatsApp Web con el mensaje pre-armado y <b>auto-tilda</b> la póliza como gestionada.</li>
                </ul>
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

      <ExportarExcelModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} datos={prepararDatosExportacion()} nombreArchivo={`Reporte_${tipoAlertaActiva === "RENOVACION" ? "Vencimientos" : "Cobranzas"}_${new Date().toISOString().split("T")[0]}`} />
      <Toast message={toast.msg} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}