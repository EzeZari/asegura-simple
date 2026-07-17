"use client";

import { useEffect, useState } from "react";
import { RefreshCw, TrendingUp, AlertTriangle, Eye, EyeOff, LayoutGrid, Calendar, FileText, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import GraficosGrid from "@/components/estadisticas/GraficosGrid";
import { apiFetch } from "@/services/api"; // 🔥 IMPORTAMOS EL FETCH CON CREDENCIALES

export default function EstadisticasPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // FILTRO DE TIEMPO
  const [periodo, setPeriodo] = useState<"mes" | "trimestre" | "anio" | "historico" | "personalizado">("historico");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [visibilidad, setVisibilidad] = useState({
    salud: true, companias: true, ramas: true,
  });

  const fetchEstadisticas = async () => {
    if (periodo === "personalizado" && (!fechaInicio || !fechaFin)) return;

    try {
      setIsRefreshing(true);
      setError("");
      
      // 🔥 REEMPLAZO CLAVE: Ahora apunta a la nueva ruta separada
      let url = `/api/estadisticas/graficos?periodo=${periodo}`;
      if (periodo === "personalizado") {
        url += `&inicio=${fechaInicio}&fin=${fechaFin}`;
      }

      const res = await apiFetch(url);
      if (!res.ok) throw new Error("Error al cargar los datos");
      
      const json = await res.json();
      
      if (json && typeof json === 'object') {
        setData(json);
      } else {
        throw new Error("Formato de datos devuelto por el servidor es inválido.");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las estadísticas.");
      setData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (periodo !== "personalizado") {
      fetchEstadisticas();
    }
  }, [periodo]);

  // LA MAGIA DEL PDF CON HTML-TO-IMAGE
  const descargarPDF = async () => {
    try {
      setIsPrinting(true);
      const element = document.getElementById("reporte-completo");
      if (!element) return;

      const { toPng } = await import("html-to-image");
      const jsPDF = (await import("jspdf")).default;

      const dataUrl = await toPng(element, { quality: 0.95, backgroundColor: '#f9fafb' });
      
      const imgWidth = 210; 
      const imgHeight = (element.offsetHeight * imgWidth) / element.offsetWidth;
      const alturaPagina = imgHeight > 297 ? imgHeight : 297; 

      const pdf = new jsPDF("p", "mm", [210, alturaPagina]);
      pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Reporte_Agencia_${new Date().toLocaleDateString('es-AR')}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("Hubo un error al generar el PDF.");
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
        <RefreshCw className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  // 🔥 NUEVA LÓGICA DE CÁLCULO DE PÓLIZAS 🔥
  const totalPolizas = data?.porEstado?.reduce((acc: number, curr: any) => acc + curr.value, 0) || 0;
  
  // Agregué 'VIGENTE' por las dudas, así te capta el estado sea como sea que esté en la base de datos
  const polizasActivas = data?.porEstado?.find(
    (estado: any) => estado.name.toUpperCase() === 'ACTIVA' || estado.name.toUpperCase() === 'VIGENTE'
  )?.value || 0;
  
  const polizasInactivas = totalPolizas - polizasActivas;

  return (
    <div id="reporte-completo" className="p-4 md:p-8 flex flex-col gap-5 md:gap-6 bg-gray-50/50 min-h-screen">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Estadísticas de Cartera</h1>
          <p className="text-gray-500 text-sm mt-1">Métricas avanzadas, tendencias de crecimiento e informes exportables.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
          <button 
            onClick={descargarPDF}
            disabled={isPrinting}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-700 text-white px-4 py-3 md:py-2.5 rounded-lg font-medium hover:bg-green-800 transition-all shadow-sm active:scale-95 disabled:bg-green-600/50"
          >
            <FileText size={18} />
            {isPrinting ? "Generando PDF..." : "Exportar Reporte PDF"}
          </button>
          <button 
            onClick={fetchEstadisticas}
            disabled={isRefreshing}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 md:py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin text-green-600" : "text-gray-500"} />
            Actualizar
          </button>
        </div>
      </div>

      {/* FILTROS INTERACTIVOS */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 shrink-0">
          <Calendar size={18} className="text-green-600" />
          <span>Período bajo análisis:</span>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full xl:w-auto">
          <div className="flex flex-wrap bg-gray-100 p-1 rounded-xl gap-1 w-full md:w-auto">
            {(["mes", "trimestre", "anio", "historico", "personalizado"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`flex-1 sm:flex-none px-2 py-2 md:px-3 md:py-2 rounded-lg text-[10px] md:text-xs font-bold capitalize transition-all ${
                  periodo === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {p === "anio" ? "Este Año" : p === "historico" ? "Histórico" : p}
              </button>
            ))}
          </div>

          {/* RANGO DE FECHAS PERSONALIZADO */}
          {periodo === "personalizado" && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in slide-in-from-left-4 w-full md:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full sm:w-auto border border-gray-200 text-gray-600 rounded-lg px-2 py-2 md:py-1.5 text-xs outline-none focus:border-green-500 bg-white"
                />
                <span className="text-gray-400 font-bold hidden sm:block">-</span>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full sm:w-auto border border-gray-200 text-gray-600 rounded-lg px-2 py-2 md:py-1.5 text-xs outline-none focus:border-green-500 bg-white"
                />
              </div>
              <button
                onClick={fetchEstadisticas}
                disabled={!fechaInicio || !fechaFin}
                className="w-full sm:w-auto justify-center bg-green-700 text-white px-3 py-2 md:py-1.5 rounded-lg text-xs font-bold disabled:bg-gray-300 hover:bg-green-800 transition-colors flex items-center gap-1"
              >
                <Search size={14} /> Aplicar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 shrink-0">
          <LayoutGrid size={18} className="text-gray-400" />
          <span>Configurar gráficos visibles:</span>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {(["salud", "companias", "ramas"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setVisibilidad(prev => ({ ...prev, [key]: !prev[key] }))}
              className={`flex-1 sm:flex-none justify-center items-center gap-2 px-2 py-2 md:px-3 md:py-1.5 rounded-xl text-[10px] md:text-xs font-bold transition-all border ${
                visibilidad[key as keyof typeof visibilidad] ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200 opacity-60"
              }`}
            >
              {visibilidad[key as keyof typeof visibilidad] ? <Eye size={14} className="shrink-0" /> : <EyeOff size={14} className="shrink-0" />}
              <span className="whitespace-nowrap">{key === "salud" ? "Salud de Cartera" : key === "companias" ? "Compañías" : "Ramas de Seguro"}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
          {error}
        </div>
      )}

      {/* TARJETAS SUPERIORES CON INDICADOR DE TENDENCIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        {/* 🔥 TARJETA ACTUALIZADA PARA MOSTRAR ACTIVAS VS TOTAL 🔥 */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-5 md:p-6 text-white shadow-md flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-green-100 font-medium text-xs md:text-sm mb-1 uppercase tracking-wider truncate">
              {periodo === "historico" ? "Cartera Activa" : "Producción del Período"}
            </p>
            <h3 className="text-3xl md:text-4xl font-black truncate">
              {periodo === "historico" ? polizasActivas : data?.tendencia?.unidadesActuales || 0}{" "}
              <span className="text-lg md:text-xl font-normal opacity-80">
                {periodo === "historico" ? "pólizas" : "nuevas"}
              </span>
            </h3>
            
            {/* Si estamos viendo el histórico, mostramos el desglose real */}
            {periodo === "historico" && totalPolizas > 0 && (
              <div className="flex items-center mt-2 bg-white/10 px-2.5 py-1 rounded-lg text-xs md:text-sm w-fit font-medium text-green-50">
                Total histórico: {totalPolizas} ({polizasInactivas} inactivas)
              </div>
            )}

            {/* Si estamos en un período específico, mostramos la tendencia que ya tenías */}
            {periodo !== "historico" && (
              <div className="flex items-center gap-1.5 mt-2 bg-white/10 px-2.5 py-1 rounded-lg text-[10px] md:text-xs w-fit font-bold">
                {data?.tendencia?.porcentaje >= 0 ? (
                  <>
                    <ArrowUpRight size={14} className="text-green-300 shrink-0" />
                    <span className="truncate">+{data.tendencia.porcentaje}% vs anterior</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight size={14} className="text-red-300 shrink-0" />
                    <span className="truncate">{data.tendencia.porcentaje}% vs anterior</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="bg-white/20 p-3 md:p-4 rounded-full backdrop-blur-sm shrink-0">
            <TrendingUp size={28} className="text-white md:w-8 md:h-8" />
          </div>
        </div>

        {data?.siniestrosAbiertos > 0 ? (
          <div className="bg-gradient-to-br from-orange-500 to-red-500 border border-orange-200 rounded-2xl p-5 md:p-6 flex items-center justify-between shadow-md text-white gap-4">
            <div className="min-w-0">
              <p className="text-orange-100 font-medium text-xs md:text-sm mb-1 uppercase tracking-wider truncate">Atención Requerida</p>
              <h3 className="text-2xl md:text-3xl font-black truncate">{data.siniestrosAbiertos} Siniestros abiertos</h3>
              <p className="text-orange-50 text-xs md:text-sm mt-1 opacity-90 truncate">Casos activos en gestión.</p>
            </div>
            <div className="bg-white/20 p-3 md:p-4 rounded-full backdrop-blur-sm shrink-0">
              <AlertTriangle size={28} className="text-white md:w-8 md:h-8" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 md:p-6 flex items-center justify-between border border-gray-200 shadow-sm gap-4">
            <div className="min-w-0">
              <p className="text-gray-400 font-medium text-xs md:text-sm mb-1 uppercase tracking-wider truncate">Estado de Siniestros</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 truncate">Todo en orden</h3>
              <p className="text-gray-500 text-xs md:text-sm mt-1 truncate">No hay reclamos pendientes.</p>
            </div>
            <div className="bg-gray-100 p-3 md:p-4 rounded-full text-gray-400 shrink-0">
              <AlertTriangle size={28} className="md:w-8 md:h-8" />
            </div>
          </div>
        )}
      </div>

      <GraficosGrid data={data} visibilidad={visibilidad} />
    </div>
  );
}