"use client";

import { Activity, User } from "lucide-react";

export default function RecentActivity({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  // 🔥 Badges de colores atenuados para el modo oscuro
  const getActionBadgeStyle = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("alta")) return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30";
    if (t.includes("baja")) return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/30";
    if (t.includes("desactivación")) return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30";
    if (t.includes("edición")) return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30";
    return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"; 
  };

  return (
    // 🔥 Contenedor principal
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      
      <div className="p-4 lg:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 transition-colors">
        <Activity className="text-green-700 dark:text-green-500 w-5 h-5 lg:w-6 lg:h-6 transition-colors" />
        <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white transition-colors">Actividad Reciente</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-[10px] lg:text-xs uppercase tracking-wider transition-colors">
              <th className="p-3 lg:p-4 font-bold whitespace-nowrap">Acción</th>
              <th className="p-3 lg:p-4 font-bold min-w-[200px]">Detalle</th>
              <th className="p-3 lg:p-4 font-bold whitespace-nowrap">Cliente</th>
              <th className="p-3 lg:p-4 font-bold whitespace-nowrap">Fecha</th>
            </tr>
          </thead>
          {/* 🔥 Divisor de filas adaptado */}
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 transition-colors">
            {data.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-3 lg:p-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] lg:text-xs font-bold transition-colors ${getActionBadgeStyle(item.type)}`}>
                    {item.type}
                  </span>
                </td>
                <td className="p-3 lg:p-4 font-medium text-gray-900 dark:text-gray-100 text-xs lg:text-sm transition-colors">
                  {item.detail}
                </td>
                <td className="p-3 lg:p-4 text-xs lg:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap transition-colors">
                  {item.client ? (
                    <span className="flex items-center gap-1.5">
                      <User size={14} className="text-gray-400 dark:text-gray-500 shrink-0" /> {item.client}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic">No aplica</span>
                  )}
                </td>
                <td className="p-3 lg:p-4 text-xs lg:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap transition-colors">
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