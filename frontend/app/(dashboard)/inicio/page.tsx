"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import { useAuthStore } from "@/store/authStore";
import { Users, FileText, AlertCircle, Building, CalendarClock, ShieldAlert, ChevronLeft, ChevronRight, PhoneForwarded, Activity, Bell } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { apiFetch } from "@/services/api";
import TutorialTour from "@/components/ui/tours/TutorialTour";
import { generarLinkWhatsApp } from "@/utils/whatsapp";

export default function DashboardPage() {
  const router = useRouter(); 
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken); 
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // 🔥 AHORA GUARDAMOS LAS TRES PLANTILLAS EN EL DASHBOARD TAMBIÉN
  const [plantillas, setPlantillas] = useState({
    proxima: "Hola [Nombre], te avisamos que tu póliza de [Rama] ([NroPoliza]) en [Compania] vence el próximo [Vencimiento]. ¿Avanzamos con la renovación?",
    critica: "Hola [Nombre], te recuerdo que tu póliza de [Rama] ([NroPoliza]) vence en unos días ([Vencimiento]). Avisame así la renovamos a tiempo.",
    vencida: "Hola [Nombre], te escribo urgente porque tu póliza de [Rama] ([NroPoliza]) venció el [Vencimiento]. Avisame si la renovamos para no dejarte sin cobertura."
  });

  const [ordenVista, setOrdenVista] = useState<"actividad" | "alertas">("alertas");

  const ITEMS_POR_PAGINA = 5;
  const [paginaRenovaciones, setPaginaRenovaciones] = useState(1);
  const [paginaSiniestros, setPaginaSiniestros] = useState(1);

  useEffect(() => {
    const ordenGuardado = localStorage.getItem("asegurasimple_orden_dashboard");
    if (ordenGuardado === "actividad" || ordenGuardado === "alertas") {
      setOrdenVista(ordenGuardado);
    }
  }, []);

  const cambiarOrden = (nuevoOrden: "actividad" | "alertas") => {
    setOrdenVista(nuevoOrden);
    localStorage.setItem("asegurasimple_orden_dashboard", nuevoOrden);
  };

  useEffect(() => {
    if (!accessToken) return; 

    setMounted(true);
    
    apiFetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    // 🔥 BUSCAMOS LAS TRES PLANTILLAS Y LAS CARGAMOS
    apiFetch('/api/agencia')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setPlantillas(prev => ({
            proxima: data.mensajeVencimiento || prev.proxima,
            critica: data.mensajePolizaCritica || prev.critica,
            vencida: data.mensajePolizaVencida || prev.vencida
          }));
        }
      })
      .catch((err) => console.error("Error al cargar la plantilla:", err));

  }, [accessToken]);

  const statsReales = [
    { title: "Total Asegurados", value: isLoading ? "..." : dashboardData?.totalAsegurados?.toString() || "0", description: "Clientes activos", icon: Users, trend: "neutral" as const, href: "/asegurados" },
    { title: "Pólizas Activas", value: isLoading ? "..." : dashboardData?.polizasActivas?.toString() || "0", description: "Coberturas vigentes", icon: FileText, trend: "neutral" as const, href: "/polizas" },
    { title: "Vencimientos (30 días)", value: isLoading ? "..." : dashboardData?.vencimientos?.toString() || "0", description: "Requieren atención", icon: AlertCircle, trend: dashboardData?.vencimientos > 0 ? "down" : "neutral", href: "/alertas" },
    { title: "Aseguradoras", value: isLoading ? "..." : dashboardData?.totalCompanias?.toString() || "0", description: "Compañías conectadas", icon: Building, trend: "neutral" as const, href: "/companias" },
  ];

  const actividadSegura = dashboardData?.actividadReciente?.map((item: any) => ({
    ...item,
    type: item.type || item.tipo || item.accion || "",
    tipo: item.tipo || item.type || item.accion || ""
  })) || [];

  // 🔥 LÓGICA INTELIGENTE: Calcula los días, asigna el color y ELIGE LA PLANTILLA
  const calcularUrgencia = (fechaVencimiento: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vto = new Date(fechaVencimiento);
    vto.setHours(0, 0, 0, 0);
    
    const diffTime = vto.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { 
        text: `Venció hace ${Math.abs(diffDays)} días`, 
        color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200", 
        plantillaSeleccionada: plantillas.vencida 
      };
    }
    if (diffDays === 0) {
      return { 
        text: "Vence HOY", 
        color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200", 
        plantillaSeleccionada: plantillas.critica 
      };
    }
    if (diffDays <= 7) {
      return { 
        text: `En ${diffDays} días`, 
        color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200", 
        plantillaSeleccionada: plantillas.critica 
      };
    }
    return { 
      text: `En ${diffDays} días`, 
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200", 
      plantillaSeleccionada: plantillas.proxima 
    };
  };

  const renovacionesTotales = dashboardData?.renovacionesProximas || [];
  const totalPaginasRen = Math.max(1, Math.ceil(renovacionesTotales.length / ITEMS_POR_PAGINA));
  const renovacionesPaginadas = renovacionesTotales.slice((paginaRenovaciones - 1) * ITEMS_POR_PAGINA, paginaRenovaciones * ITEMS_POR_PAGINA);

  const siniestrosTotales = dashboardData?.siniestrosActivos || [];
  const totalPaginasSin = Math.max(1, Math.ceil(siniestrosTotales.length / ITEMS_POR_PAGINA));
  const siniestrosPaginados = siniestrosTotales.slice((paginaSiniestros - 1) * ITEMS_POR_PAGINA, paginaSiniestros * ITEMS_POR_PAGINA);

  const SeccionActividad = (
    <div className={`tour-actividad ${ordenVista === "alertas" ? "pb-10" : "mt-2"}`}>
      <RecentActivity data={isLoading ? [] : actividadSegura} />
    </div>
  );

  const SeccionAlertas = !isLoading && (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 w-full ${ordenVista === "actividad" ? "pb-10" : "mt-2"}`}>
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors flex flex-col">
        <div className="p-4 lg:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <CalendarClock size={20} />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">Renovaciones Próximas</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Seguimiento comercial de carteras por vencer (Próx. 30 días)</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1 min-h-[300px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Cliente</th>
                <th className="p-4 font-bold">Plazo</th>
                <th className="p-4 font-bold">Compañía / Póliza</th>
                <th className="p-4 font-bold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {renovacionesPaginadas.length > 0 ? (
                renovacionesPaginadas.map((poliza: any, i: number) => {
                  // Calculamos la urgencia y extraemos la plantilla correspondiente
                  const urgencia = calcularUrgencia(poliza.fechaVencimiento);
                  return (
                    <tr key={i} onClick={() => router.push(`/polizas/${poliza.id}`)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                      <td className="p-4 font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {poliza.asegurado?.nombre} {poliza.asegurado?.apellido}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${urgencia.color}`}>{urgencia.text}</span>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">
                        {poliza.compania?.nombre} • {poliza.nroPoliza}
                      </td>
                      <td className="p-4 text-right">
                        {/* 🔥 LE PASAMOS AL AYUDANTE LA PLANTILLA QUE CORRESPONDE A SUS DÍAS */}
                        <a 
                          onClick={(e) => e.stopPropagation()} 
                          href={generarLinkWhatsApp(poliza, urgencia.plantillaSeleccionada)}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30 rounded-lg text-xs font-bold transition-colors"
                        >
                          <PhoneForwarded size={14} /> Avisar
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No hay renovaciones pendientes para los próximos 30 días. ¡Cartera al día!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {renovacionesTotales.length > ITEMS_POR_PAGINA && (
          <div className="flex items-center justify-center gap-4 p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
            <button onClick={() => setPaginaRenovaciones(p => Math.max(1, p - 1))} disabled={paginaRenovaciones === 1} className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all disabled:opacity-30 disabled:pointer-events-none"><ChevronLeft size={18} /></button>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 min-w-[70px] text-center">Pág {paginaRenovaciones} de {totalPaginasRen}</span>
            <button onClick={() => setPaginaRenovaciones(p => Math.min(totalPaginasRen, p + 1))} disabled={paginaRenovaciones === totalPaginasRen} className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all disabled:opacity-30 disabled:pointer-events-none"><ChevronRight size={18} /></button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col flex-1 overflow-hidden transition-colors">
          <div className="p-4 lg:p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
              <ShieldAlert size={18} className="text-orange-500" /> Siniestros Abiertos
            </div>
          </div>
          
          <div className="flex flex-col gap-1 p-4 flex-1 min-h-[300px]">
            {siniestrosPaginados.length > 0 ? (
              siniestrosPaginados.map((sin: any, i: number) => (
                <div key={i} onClick={() => router.push(`/siniestros/${sin.id}`)} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors group">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate w-32 group-hover:text-orange-500 transition-colors">
                      {sin.asegurado?.nombre} {sin.asegurado?.apellido}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(sin.fechaOcurrencia).toLocaleDateString("es-AR")}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                    {sin.estado}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No hay siniestros activos.</p>
            )}
          </div>

          {siniestrosTotales.length > ITEMS_POR_PAGINA && (
            <div className="flex items-center justify-center gap-4 p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
              <button onClick={() => setPaginaSiniestros(p => Math.max(1, p - 1))} disabled={paginaSiniestros === 1} className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all disabled:opacity-30 disabled:pointer-events-none"><ChevronLeft size={18} /></button>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400 min-w-[70px] text-center">Pág {paginaSiniestros} de {totalPaginasSin}</span>
              <button onClick={() => setPaginaSiniestros(p => Math.min(totalPaginasSin, p + 1))} disabled={paginaSiniestros === totalPaginasSin} className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all disabled:opacity-30 disabled:pointer-events-none"><ChevronRight size={18} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 w-full gap-5 lg:gap-8 min-h-screen transition-colors duration-300">
      
      <TutorialTour />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2 lg:pb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
            Bienvenido de nuevo, {mounted ? user?.nombre : "Productor"}
          </h1>
          <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1 transition-colors">
            Acá tenés el resumen en tiempo real de tu cartera de negocios.
          </p>
        </div>

        <div className="flex items-center bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-200 dark:border-gray-800 w-full sm:w-auto transition-colors shrink-0">
          <button 
            onClick={() => cambiarOrden("alertas")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${ordenVista === "alertas" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            <Bell size={14} /> Gestión Operativa
          </button>
          <button 
            onClick={() => cambiarOrden("actividad")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${ordenVista === "actividad" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            <Activity size={14} /> Monitor de Actividad
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 tour-estadisticas">
        {statsReales.map((stat, index) => (
          <StatCard key={index} {...stat} trend={stat.trend as any} />
        ))}
      </div>

      {ordenVista === "actividad" ? (
        <>
          {SeccionActividad}
          {SeccionAlertas}
        </>
      ) : (
        <>
          {SeccionAlertas}
          {SeccionActividad}
        </>
      )}

    </div>
  );
}