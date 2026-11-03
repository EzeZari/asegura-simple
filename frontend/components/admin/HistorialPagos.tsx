"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  CreditCard, ChevronDown, ChevronUp, Loader2, 
  CheckCircle2, XCircle, Clock, Search, Wallet, TrendingUp, AlertCircle, CalendarDays, Download, LineChart
} from "lucide-react";
import * as XLSX from "xlsx"; 

export default function HistorialPagos() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTiempo, setFiltroTiempo] = useState<"todos" | "este_mes" | "mes_pasado">("este_mes");

  // 🔥 MEMORIA DEL PANEL
  useEffect(() => {
    const guardado = localStorage.getItem("panel_pagos");
    if (guardado !== null) setIsExpanded(JSON.parse(guardado));
  }, []);

  const togglePanel = () => {
    const nuevoEstado = !isExpanded;
    setIsExpanded(nuevoEstado);
    localStorage.setItem("panel_pagos", JSON.stringify(nuevoEstado));
  };

  useEffect(() => {
    if (isExpanded && pagos.length === 0) {
      fetchPagos();
    }
  }, [isExpanded]);

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/pagos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPagos(data);
      }
    } catch (err) {
      console.error("Error cargando pagos", err);
    } finally {
      setLoading(false);
    }
  };

  const pagosFiltrados = useMemo(() => {
    return pagos.filter(p => {
      const busqueda = searchTerm.toLowerCase();
      const matchSearch = p.user?.nombre?.toLowerCase().includes(busqueda) || 
                          p.user?.email?.toLowerCase().includes(busqueda) ||
                          p.metodoPago?.toLowerCase().includes(busqueda);

      const date = new Date(p.fechaPago);
      const today = new Date();
      let matchTime = true;

      if (filtroTiempo === 'este_mes') {
        matchTime = date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      } else if (filtroTiempo === 'mes_pasado') {
        const lastMonth = new Date();
        lastMonth.setMonth(today.getMonth() - 1);
        matchTime = date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
      }

      return matchSearch && matchTime;
    });
  }, [pagos, searchTerm, filtroTiempo]);

  const totalRecaudado = pagosFiltrados
    .filter(p => ["approved", "autorizado"].includes(p.estado?.toLowerCase()))
    .reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
    
  const cobrosExitosos = pagosFiltrados.filter(p => ["approved", "autorizado"].includes(p.estado?.toLowerCase())).length;
  const cobrosFallidos = pagosFiltrados.filter(p => ["rejected", "cancelado"].includes(p.estado?.toLowerCase())).length;

  const datosGrafico = useMemo(() => {
    const pagosExitosos = pagosFiltrados.filter(p => ["approved", "autorizado"].includes(p.estado?.toLowerCase()));
    const diasAgrupados: Record<string, number> = {};

    pagosExitosos.forEach(p => {
      const fecha = new Date(p.fechaPago);
      const diaStr = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
      diasAgrupados[diaStr] = (diasAgrupados[diaStr] || 0) + Number(p.monto);
    });

    const ordenado = Object.keys(diasAgrupados).sort((a, b) => {
      const [diaA, mesA] = a.split('/');
      const [diaB, mesB] = b.split('/');
      return new Date(2024, Number(mesA)-1, Number(diaA)).getTime() - new Date(2024, Number(mesB)-1, Number(diaB)).getTime();
    });

    const maxMonto = Math.max(...Object.values(diasAgrupados), 1); 

    return ordenado.map(dia => ({
      dia,
      monto: diasAgrupados[dia],
      porcentaje: (diasAgrupados[dia] / maxMonto) * 85
    }));
  }, [pagosFiltrados]);

  const chartPoints = datosGrafico.map((item, i) => {
    const x = datosGrafico.length === 1 ? 50 : (i / (datosGrafico.length - 1)) * 100;
    const y = 100 - item.porcentaje;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = datosGrafico.length > 1 ? `0,100 ${chartPoints} 100,100` : "";

  const formatearFechaHora = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " hs";
  };

  const exportarExcel = () => {
    if (pagosFiltrados.length === 0) return;

    const datosFormateados = pagosFiltrados.map(pago => ({
      "Fecha y Hora": formatearFechaHora(pago.fechaPago),
      "Agencia / Cliente": pago.user?.nombre || "Usuario Eliminado",
      "Email": pago.user?.email || "-",
      "Monto Cobrado ($)": Number(pago.monto),
      "Método de Pago": pago.metodoPago?.replace(/_/g, ' ') || "Manual",
      "Estado": pago.estado?.toUpperCase() || "PENDIENTE",
      "ID Transacción": pago.mpPagoId || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosFormateados);
    worksheet["!cols"] = [ { wch: 20 }, { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 } ];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Facturación");
    
    const mesNombre = filtroTiempo === 'este_mes' ? 'Este_Mes' : filtroTiempo === 'mes_pasado' ? 'Mes_Pasado' : 'Historico';
    XLSX.writeFile(workbook, `Reporte_Ingresos_${mesNombre}.xlsx`);
  };

  const getEstadoBadge = (estado: string) => {
    const est = estado?.toLowerCase() || "";
    if (est === "approved" || est === "autorizado") return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit"><CheckCircle2 size={12}/> Aprobado</span>;
    if (est === "rejected" || est === "cancelado") return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit"><XCircle size={12}/> Rechazado</span>;
    return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit"><Clock size={12}/> {estado || "Pendiente"}</span>;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-300 mt-2">
      
      <div 
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none ${isExpanded ? 'mb-6 border-b border-gray-800 pb-6' : ''}`}
        onClick={togglePanel}
      >
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="text-emerald-500 w-6 h-6" /> Finanzas y Cobranzas
          </h2>
          <p className="text-sm text-gray-400 mt-1">Control de transacciones, flujo de caja y evolución gráfica.</p>
        </div>
        <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-full transition-colors shrink-0 self-end md:self-auto">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col gap-6">
          
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-500 w-8 h-8" /></div>
          ) : pagos.length === 0 ? (
            <div className="bg-gray-950/50 border border-gray-800 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center">
              <CreditCard size={48} className="text-gray-700 mb-4" />
              <p className="text-gray-400 font-medium text-lg">Aún no hay transacciones registradas.</p>
              <p className="text-gray-500 text-sm mt-1">Los cobros aparecerán acá automáticamente.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5"><Wallet size={100} /></div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl"><TrendingUp size={24} className="text-emerald-500" /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Ingresos (Filtro)</p>
                    <p className="text-2xl font-black text-white">${totalRecaudado.toLocaleString('es-AR')}</p>
                  </div>
                </div>

                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl"><CheckCircle2 size={24} className="text-blue-500" /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Cobros Exitosos</p>
                    <p className="text-2xl font-black text-white">{cobrosExitosos}</p>
                  </div>
                </div>

                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                  <div className="p-3 bg-red-500/10 rounded-xl"><AlertCircle size={24} className="text-red-500" /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Fallidos / Rechazados</p>
                    <p className="text-2xl font-black text-white">{cobrosFallidos}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-gray-950 p-2 md:p-3 rounded-2xl border border-gray-800 mt-2">
                <div className="relative w-full xl:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar agencia, email o método..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto custom-scrollbar pb-1 xl:pb-0">
                  <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 shrink-0">
                    <button onClick={() => setFiltroTiempo("este_mes")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${filtroTiempo === 'este_mes' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
                      <CalendarDays size={14}/> Este Mes
                    </button>
                    <button onClick={() => setFiltroTiempo("mes_pasado")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${filtroTiempo === 'mes_pasado' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
                      <CalendarDays size={14}/> Mes Pasado
                    </button>
                    <button onClick={() => setFiltroTiempo("todos")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filtroTiempo === 'todos' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
                      Histórico
                    </button>
                  </div>
                  
                  <button 
                    onClick={exportarExcel}
                    className="shrink-0 flex items-center gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Download size={16} /> Descargar Reporte
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar bg-gray-950 border border-gray-800 rounded-2xl shadow-inner">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-900/50 text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-800">
                      <th className="p-4 font-bold">Fecha y Hora</th>
                      <th className="p-4 font-bold">Agencia / Usuario</th>
                      <th className="p-4 font-bold">Monto Cobrado</th>
                      <th className="p-4 font-bold">Método</th>
                      <th className="p-4 font-bold text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {pagosFiltrados.map((pago) => (
                      <tr key={pago.id} className="hover:bg-gray-800/40 transition-colors group">
                        <td className="p-4 text-sm text-gray-400 font-mono flex items-center gap-2">
                          <Clock size={14} className="text-gray-600 group-hover:text-emerald-500 transition-colors"/>
                          {formatearFechaHora(pago.fechaPago)}
                        </td>
                        <td className="p-4">
                          <span className="block text-sm font-bold text-gray-200">{pago.user?.nombre || "Usuario Eliminado"}</span>
                          <span className="block text-xs font-medium text-gray-500 mt-0.5">{pago.user?.email || "Sin email"}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-base font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            ${Number(pago.monto).toLocaleString('es-AR')}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs text-gray-400 capitalize bg-gray-800 px-2 py-1 rounded-md border border-gray-700">
                            {pago.metodoPago?.replace(/_/g, ' ') || "Manual"}
                          </span>
                        </td>
                        <td className="p-4 flex justify-end">
                          {getEstadoBadge(pago.estado)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {datosGrafico.length > 0 && (
                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-inner mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LineChart className="text-emerald-500" size={22} />
                      <h3 className="text-white font-bold text-lg">Evolución de Ingresos</h3>
                    </div>
                    <span className="text-xs font-bold text-emerald-500/80 bg-emerald-500/10 px-2 py-1 rounded-md uppercase tracking-wider">Línea de Tiempo</span>
                  </div>
                  
                  <div className="relative h-56 w-full mt-4 mb-2">
                    <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="gradient-emerald" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {areaPoints && <polygon points={areaPoints} fill="url(#gradient-emerald)" />}
                      <polyline points={chartPoints} fill="none" stroke="#10b981" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                    </svg>
                    
                    {datosGrafico.map((item, index) => {
                      const x = datosGrafico.length === 1 ? 50 : (index / (datosGrafico.length - 1)) * 100;
                      const y = 100 - item.porcentaje;
                      
                      return (
                        <div 
                          key={index}
                          className="absolute group flex flex-col items-center cursor-crosshair z-10"
                          style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          <div className="absolute bottom-5 bg-gray-800 border border-gray-700 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-2xl pointer-events-none mb-1">
                            ${item.monto.toLocaleString('es-AR')}
                            <span className="block text-[10px] text-gray-400 font-normal mt-0.5">{item.dia}</span>
                          </div>
                          <div className="w-3.5 h-3.5 bg-gray-900 border-[2.5px] border-emerald-500 rounded-full group-hover:bg-emerald-400 group-hover:scale-125 transition-all shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between w-full mt-2 text-[10px] text-gray-500 font-mono relative">
                    {datosGrafico.map((item, index) => {
                      const mostrarEtiqueta = datosGrafico.length <= 12 || index % Math.ceil(datosGrafico.length / 10) === 0;
                      const x = datosGrafico.length === 1 ? 50 : (index / (datosGrafico.length - 1)) * 100;
                      
                      return mostrarEtiqueta ? (
                        <span key={index} className="absolute transform -translate-x-1/2 mt-1" style={{ left: `${x}%` }}>
                          {item.dia}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <div className="h-2"></div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}