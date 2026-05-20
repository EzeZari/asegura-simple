"use client";

import { useEffect, useState } from "react";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList 
} from "recharts";
import { AlertTriangle, Loader2, RefreshCw, TrendingUp } from "lucide-react";

// Paletas de colores vibrantes
const COLORES_COMPANIAS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#6366f1'];
const COLORES_ESTADOS = { 
  'Vigente': '#10b981', // Verde esmeralda
  'Vencida': '#ef4444', // Rojo fuerte
  'Pendiente': '#f59e0b', // Naranja/Amarillo
  'Anulada': '#64748b'  // Gris
};
const COLORES_BARRAS = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

// Función matemática para dibujar los porcentajes ADENTRO de la dona
const RADIAN = Math.PI / 180;
const renderPorcentaje = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent * 100 < 5) return null; // No dibuja el % si la porción es muy chiquita

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-xs drop-shadow-md">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function EstadisticasPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEstadisticas = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("http://localhost:3001/api/dashboard/graficos");
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
    fetchEstadisticas();
  }, []);

  if (isLoading && !data) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">{error}</div>
      </div>
    );
  }

  // Calculamos el total de pólizas para mostrarlo arriba
  const totalPolizas = data?.porEstado?.reduce((acc: number, curr: any) => acc + curr.value, 0) || 0;

  return (
    <div className="p-8 flex flex-col gap-6 animate-in fade-in duration-300 bg-gray-50/50 min-h-screen">
      
      {/* ENCABEZADO HECHO A MANO (Para asegurar que no salga el botón "+" fantasma) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Estadísticas de Cartera</h1>
          <p className="text-gray-500 text-sm mt-1">Analizá el rendimiento, porcentajes y distribución de tus pólizas.</p>
        </div>
        
        <button 
          onClick={fetchEstadisticas}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw size={18} className={isRefreshing ? "animate-spin text-green-600" : "text-gray-500"} />
          {isRefreshing ? "Actualizando..." : "Actualizar Datos"}
        </button>
      </div>

      {/* Tarjetas de Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KPI: Volumen Total */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
          <div>
            <p className="text-green-100 font-medium text-sm mb-1 uppercase tracking-wider">Volumen Total</p>
            <h3 className="text-4xl font-black">{totalPolizas} <span className="text-xl font-normal opacity-80">pólizas</span></h3>
          </div>
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
            <TrendingUp size={32} className="text-white" />
          </div>
        </div>

        {/* KPI: Siniestros */}
        {data?.siniestrosAbiertos > 0 ? (
          <div className="bg-gradient-to-br from-orange-500 to-red-500 border border-orange-200 rounded-2xl p-6 flex items-center justify-between shadow-md text-white">
            <div>
              <p className="text-orange-100 font-medium text-sm mb-1 uppercase tracking-wider">Atención Requerida</p>
              <h3 className="text-3xl font-black">{data.siniestrosAbiertos} Siniestros abiertos</h3>
              <p className="text-orange-50 text-sm mt-1 opacity-90">Requieren seguimiento inmediato.</p>
            </div>
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <AlertTriangle size={32} className="text-white" />
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 flex items-center justify-between border border-slate-200">
            <div>
              <p className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">Estado de Siniestros</p>
              <h3 className="text-2xl font-bold text-slate-800">Todo en orden</h3>
              <p className="text-slate-600 text-sm mt-1">No hay siniestros pendientes.</p>
            </div>
            <div className="bg-slate-300 p-4 rounded-full">
              <AlertTriangle size={32} className="text-slate-500" />
            </div>
          </div>
        )}
      </div>

      {/* Grilla de Gráficos Visuales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Pólizas por Estado */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Salud de la Cartera</h3>
          <p className="text-sm text-gray-500 mb-4">Porcentaje de pólizas vigentes vs vencidas.</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.porEstado}
                  cx="50%"
                  cy="45%" // 🔥 Lo movemos más arriba para que la leyenda entre cómoda abajo
                  innerRadius={60} // 🔥 Achicamos el radio para que no explote los bordes
                  outerRadius={110} 
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={renderPorcentaje} 
                >
                  {data.porEstado.map((entry: any, index: number) => (
                    <Cell key={`cell-estado-${index}`} fill={COLORES_ESTADOS[entry.name as keyof typeof COLORES_ESTADOS] || '#cbd5e1'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} Pólizas`, name]} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Pólizas por Compañía */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Distribución por Compañía</h3>
          <p className="text-sm text-gray-500 mb-4">¿En qué aseguradoras se concentra el negocio?</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.porCompania}
                  cx="50%"
                  cy="45%" // 🔥 Lo movemos más arriba para que la leyenda entre cómoda abajo
                  innerRadius={60} // 🔥 Achicamos el radio para que no explote los bordes
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={renderPorcentaje}
                >
                  {data.porCompania.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORES_COMPANIAS[index % COLORES_COMPANIAS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} Pólizas`, name]} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Tipos de Riesgo */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px] lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Ramas de Seguro (Tipos de Póliza)</h3>
          <p className="text-sm text-gray-500 mb-6">Volumen de ventas según el tipo de riesgo asegurado.</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* 🔥 Le di un poco más de margen abajo (bottom: 20) para que entren bien los textos de los ejes */}
              <BarChart data={data.porTipo} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" name="Cantidad" radius={[6, 6, 0, 0]} barSize={60}>
                  {data.porTipo.map((entry: any, index: number) => (
                    <Cell key={`cell-bar-${index}`} fill={COLORES_BARRAS[index % COLORES_BARRAS.length]} />
                  ))}
                  <LabelList dataKey="value" position="top" fill="#475569" fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}