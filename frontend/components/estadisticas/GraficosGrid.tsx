"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";

const COLORES_COMPANIAS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#6366f1'];
const COLORES_ESTADOS = { 
  'Vigente': '#10b981', 
  'Vencida': '#ef4444', 
  'Pendiente': '#f59e0b', 
  'Anulada': '#64748b'  
};
const COLORES_BARRAS = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

const RADIAN = Math.PI / 180;
const renderPorcentaje = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent * 100 < 4) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-xs drop-shadow-md">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface GraficosGridProps {
  data: any;
  visibilidad: {
    salud: boolean;
    companias: boolean;
    ramas: boolean;
  };
}

export default function GraficosGrid({ data, visibilidad }: GraficosGridProps) {
  if (!visibilidad.salud && !visibilidad.companias && !visibilidad.ramas) {
    return (
      <div className="bg-white p-16 text-center rounded-2xl border border-gray-100 shadow-sm text-gray-400 font-medium">
        No elegiste ningún gráfico para visualizar. Activá las opciones de arriba para armar tu reporte personalizado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. Gráfico Salud */}
      {visibilidad.salud && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px] animate-in fade-in zoom-in-95 duration-200">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Salud de la Cartera</h3>
          <p className="text-sm text-gray-500 mb-4">Porcentaje de estados de pólizas en el período.</p>
          <div className="flex-1 w-full">
            {data.porEstado.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">Sin datos en este período</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.porEstado}
                    cx="50%"
                    cy="42%" 
                    innerRadius={55} 
                    outerRadius={100} 
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={renderPorcentaje} 
                  >
                    {data.porEstado.map((entry: any, index: number) => (
                      <Cell key={`cell-estado-${index}`} fill={COLORES_ESTADOS[entry.name as keyof typeof COLORES_ESTADOS] || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} Pólizas`, name]} />
                  <Legend verticalAlign="bottom" height={40} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* 2. Gráfico Compañías */}
      {visibilidad.companias && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px] animate-in fade-in zoom-in-95 duration-200">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Distribución por Compañía</h3>
          <p className="text-sm text-gray-500 mb-4">Aseguradoras donde se radicó la producción.</p>
          <div className="flex-1 w-full">
            {data.porCompania.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">Sin datos en este período</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.porCompania}
                    cx="50%"
                    cy="42%" 
                    innerRadius={55} 
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={renderPorcentaje}
                  >
                    {data.porCompania.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORES_COMPANIAS[index % COLORES_COMPANIAS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} Pólizas`, name]} />
                  <Legend verticalAlign="bottom" height={40} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* 3. Gráfico Ramas (Barras) */}
      {visibilidad.ramas && (
        <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px] animate-in fade-in zoom-in-95 duration-200 ${
          visibilidad.salud && visibilidad.companias ? "lg:col-span-2" : "lg:col-span-1"
        }`}>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Ramas de Seguro (Tipos de Póliza)</h3>
          <p className="text-sm text-gray-500 mb-6">Volumen según el tipo de riesgo comercializado.</p>
          <div className="flex-1 w-full">
            {data.porTipo.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">Sin producción en este período</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.porTipo} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" name="Cantidad" radius={[6, 6, 0, 0]} barSize={60}>
                    {data.porTipo.map((entry: any, index: number) => (
                      <Cell key={`cell-bar-${index}`} fill={COLORES_BARRAS[index % COLORES_BARRAS.length]} />
                    ))}
                    <LabelList dataKey="value" position="top" fill="#475569" fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

    </div>
  );
}