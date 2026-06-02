"use client";

import { Activity, User } from "lucide-react";

export default function RecentActivity({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const getActionBadgeStyle = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("alta")) return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    if (t.includes("baja")) return "bg-red-100 text-red-800 border border-red-200";
    if (t.includes("desactivación")) return "bg-amber-100 text-amber-800 border border-amber-200";
    if (t.includes("edición")) return "bg-blue-100 text-blue-800 border border-blue-200";
    return "bg-gray-100 text-gray-700 border border-gray-200"; 
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 🔥 Ajuste: Padding más amigable en móviles */}
      <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center gap-3">
        <Activity className="text-green-700 w-5 h-5 lg:w-6 lg:h-6" />
        <h2 className="text-base lg:text-lg font-bold text-gray-900">Actividad Reciente</h2>
      </div>
      
      {/* Contenedor que permite el scroll horizontal en móviles */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-[10px] lg:text-xs uppercase tracking-wider">
              {/* 🔥 Ajuste: whitespace-nowrap evita que las columnas colapsen feo */}
              <th className="p-3 lg:p-4 font-bold whitespace-nowrap">Acción</th>
              <th className="p-3 lg:p-4 font-bold min-w-[200px]">Detalle</th>
              <th className="p-3 lg:p-4 font-bold whitespace-nowrap">Cliente</th>
              <th className="p-3 lg:p-4 font-bold whitespace-nowrap">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-3 lg:p-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] lg:text-xs font-bold ${getActionBadgeStyle(item.type)}`}>
                    {item.type}
                  </span>
                </td>
                <td className="p-3 lg:p-4 font-medium text-gray-900 text-xs lg:text-sm">
                  {item.detail}
                </td>
                <td className="p-3 lg:p-4 text-xs lg:text-sm text-gray-600 whitespace-nowrap">
                  {item.client ? (
                    <span className="flex items-center gap-1.5">
                      <User size={14} className="text-gray-400 shrink-0" /> {item.client}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">No aplica</span>
                  )}
                </td>
                <td className="p-3 lg:p-4 text-xs lg:text-sm text-gray-500 whitespace-nowrap">
                  {item.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}