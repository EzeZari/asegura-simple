"use client";

import { useEffect, useState } from "react";
import { RefreshCw, TrendingUp, AlertTriangle, Eye, EyeOff, LayoutGrid, Calendar, FileText, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import GraficosGrid from "@/components/estadisticas/GraficosGrid";

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
    // Si eligió personalizado pero no puso fechas, no disparamos la búsqueda
    if (periodo === "personalizado" && (!fechaInicio || !fechaFin)) return;

    try {
      setIsRefreshing(true);
      
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/graficos?periodo=${periodo}`;
      if (periodo === "personalizado") {
        url += `&inicio=${fechaInicio}&fin=${fechaFin}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar los datos");
      
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("No se pudieron cargar las estadísticas.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Solo busca automático si NO es personalizado (para personalizado requiere clic en el botón)
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

      // Saca la foto y le pone fondo blanco para que no salga transparente
      const dataUrl = await toPng(element, { quality: 0.95, backgroundColor: '#f9fafb' });
      
      // Calculamos la proporción perfecta para que no corte los gráficos
      const imgWidth = 210; 
      const imgHeight = (element.offsetHeight * imgWidth) / element.offsetWidth;
      const alturaPagina = imgHeight > 297 ? imgHeight : 297; // Si es muy largo, estira el PDF

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
      <div className="flex h-full items-center justify-center p-8">
        <RefreshCw className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  const totalPolizas = data?.porEstado?.reduce((acc: number, curr: any) => acc + curr.value, 0) || 0;

  return (
    <div id="reporte-completo" className="p-8 flex flex-col gap-6 bg-gray-50/50 min-h-screen">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Estadísticas de Cartera</h1>
          <p className="text-gray-500 text-sm mt-1">Métricas avanzadas, tendencias de crecimiento e informes exportables.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button 
            onClick={descargarPDF}
            disabled={isPrinting}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-800 transition-all shadow-sm active:scale-95 disabled:bg-green-600/50"
          >
            <FileText size={18} />
            {isPrinting ? "Generando PDF..." : "Exportar Reporte PDF"}
          </button>
          <button 
            onClick={fetchEstadisticas}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin text-green-600" : "text-gray-500"} />
            Actualizar
          </button>
        </div>
      </div>

      {/* FILTROS INTERACTIVOS */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Calendar size={18} className="text-green-600" />
          <span>Período bajo análisis:</span>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full xl:w-auto">
          <div className="flex flex-wrap bg-gray-100 p-1 rounded-xl gap-1 w-full md:w-auto">
            {(["mes", "trimestre", "anio", "historico", "personalizado"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                  periodo === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {p === "anio" ? "Este Año" : p === "historico" ? "Histórico" : p}
              </button>
            ))}
          </div>

          {/* RANGO DE FECHAS PERSONALIZADO (Aparece solo si se selecciona la opción) */}
          {periodo === "personalizado" && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 w-full md:w-auto">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="border border-gray-200 text-gray-600 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-green-500 bg-white"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="border border-gray-200 text-gray-600 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-green-500 bg-white"
              />
              <button
                onClick={fetchEstadisticas}
                disabled={!fechaInicio || !fechaFin}
                className="bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:bg-gray-300 hover:bg-green-800 transition-colors flex items-center gap-1"
              >
                <Search size={14} /> Aplicar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <LayoutGrid size={18} className="text-gray-400" />
          <span>Configurar gráficos visibles:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["salud", "companias", "ramas"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setVisibilidad(prev => ({ ...prev, [key]: !prev[key] }))}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                visibilidad[key] ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200 opacity-60"
              }`}
            >
              {visibilidad[key] ? <Eye size={14} /> : <EyeOff size={14} />}
              {key === "salud" ? "Salud de Cartera" : key === "companias" ? "Compañías" : "Ramas de Seguro"}
            </button>
          ))}
        </div>
      </div>

      {/* TARJETAS SUPERIORES CON INDICADOR DE TENDENCIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
          <div>
            <p className="text-green-100 font-medium text-sm mb-1 uppercase tracking-wider">Producción del Período</p>
            <h3 className="text-4xl font-black">
              {periodo === "historico" ? totalPolizas : data?.tendencia?.unidadesActuales || 0}{" "}
              <span className="text-xl font-normal opacity-80">pólizas</span>
            </h3>
            
            {periodo !== "historico" && (
              <div className="flex items-center gap-1.5 mt-2 bg-white/10 px-2.5 py-1 rounded-lg text-xs w-fit font-bold">
                {data?.tendencia?.porcentaje >= 0 ? (
                  <>
                    <ArrowUpRight size={14} className="text-green-300" />
                    <span>+{data.tendencia.porcentaje}% vs período anterior</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight size={14} className="text-red-300" />
                    <span>{data.tendencia.porcentaje}% vs período anterior</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
            <TrendingUp size={32} className="text-white" />
          </div>
        </div>

        {data?.siniestrosAbiertos > 0 ? (
          <div className="bg-gradient-to-br from-orange-500 to-red-500 border border-orange-200 rounded-2xl p-6 flex items-center justify-between shadow-md text-white">
            <div>
              <p className="text-orange-100 font-medium text-sm mb-1 uppercase tracking-wider">Atención Requerida</p>
              <h3 className="text-3xl font-black">{data.siniestrosAbiertos} Siniestros abiertos</h3>
              <p className="text-orange-50 text-sm mt-1 opacity-90">Casos activos en gestión.</p>
            </div>
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <AlertTriangle size={32} className="text-white" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 flex items-center justify-between border border-gray-200 shadow-sm">
            <div>
              <p className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Estado de Siniestros</p>
              <h3 className="text-2xl font-bold text-gray-800">Todo en orden</h3>
              <p className="text-gray-500 text-sm mt-1">No hay reclamos pendientes de resolución.</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-full text-gray-400">
              <AlertTriangle size={32} />
            </div>
          </div>
        )}
      </div>

      <GraficosGrid data={data} visibilidad={visibilidad} />
    </div>
  );
}