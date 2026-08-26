"use client";

import { Activity, User } from "lucide-react";

export default function RecentActivity({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  // 🔥 Estilos para la tabla en PC
  const getBadgeStylePC = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("alta")) return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30";
    if (t.includes("baja")) return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/30";
    if (t.includes("desactivación")) return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30";
    if (t.includes("edición")) return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30";
    return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"; 
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      
      {/* Encabezado del componente */}
      <div className="p-4 lg:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 transition-colors bg-white dark:bg-gray-800 relative z-10">
        <Activity className="text-green-700 dark:text-green-500 w-5 h-5 lg:w-6 lg:h-6 transition-colors" />
        <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white transition-colors">Actividad Reciente</h2>
      </div>
      
      {/* 🔥 VISTA ESCRITORIO Y TABLET: Tabla original */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-[10px] lg:text-xs uppercase tracking-wider transition-colors">
              <th className="p-3 lg:p-4 font-bold whitespace-nowrap">Acción</th>
              <th className="p-3 lg:p-4 font-bold min-w-[200px]">Detalle</th>
              <th className="p-3 lg:p-4 font-bold whitespace-nowrap">Cliente</th>
              <th className="p-3 lg:p-4 font-bold whitespace-nowrap">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 transition-colors">
            {data.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-3 lg:p-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] lg:text-xs font-bold transition-colors ${getBadgeStylePC(item.type)}`}>
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

      {/* 🔥 VISTA CELULAR: Estilo Timeline minimalista */}
      <div className="block md:hidden p-5 pb-8">
        {/* Línea vertical principal */}
        <div className="relative border-l-2 border-gray-100 dark:border-gray-700 ml-2 space-y-7">
          {data.map((item, i) => {
            
            // Lógica para pintar el puntito y el texto según la acción en el Timeline
            let colorDot = "bg-gray-400";
            let colorText = "text-gray-600 dark:text-gray-400";
            
            const t = item.type.toLowerCase();
            if (t.includes("alta")) { colorDot = "bg-emerald-500"; colorText = "text-emerald-600 dark:text-emerald-400"; }
            else if (t.includes("baja") || t.includes("elimin")) { colorDot = "bg-red-500"; colorText = "text-red-600 dark:text-red-400"; }
            else if (t.includes("desactiv")) { colorDot = "bg-amber-500"; colorText = "text-amber-600 dark:text-amber-400"; }
            else if (t.includes("edición") || t.includes("modific")) { colorDot = "bg-blue-500"; colorText = "text-blue-600 dark:text-blue-400"; }

            return (
              <div key={i} className="relative pl-6">
                
                {/* Puntito del Timeline (Superpuesto a la línea vertical) */}
                <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-gray-800 ${colorDot}`}></div>
                
                {/* Contenido de la acción */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${colorText}`}>
                      {item.type}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap pt-0.5">
                      {item.date}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">
                    {item.detail}
                  </p>

                  {item.client && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <User size={12} className="text-gray-400 dark:text-gray-500 shrink-0" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                        {item.client}
                      </span>
                    </div>
                  )}
                </div>
                
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}