"use client";

import { Activity, User } from "lucide-react";

export default function RecentActivity({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  // Función para darle color a la etiqueta según la palabra clave
  const getActionBadgeStyle = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("alta")) return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    if (t.includes("baja")) return "bg-red-100 text-red-800 border border-red-200";
    if (t.includes("desactivación")) return "bg-amber-100 text-amber-800 border border-amber-200";
    if (t.includes("edición")) return "bg-blue-100 text-blue-800 border border-blue-200";
    return "bg-gray-100 text-gray-700 border border-gray-200"; // Por defecto
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <Activity className="text-green-700" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Actividad Reciente</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-bold">Acción</th>
              <th className="p-4 font-bold">Detalle</th>
              <th className="p-4 font-bold">Cliente</th>
              <th className="p-4 font-bold">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  {/* Acá aplicamos la función que da el color */}
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${getActionBadgeStyle(item.type)}`}>
                    {item.type}
                  </span>
                </td>
                <td className="p-4 font-medium text-gray-900 text-sm">
                  {item.detail}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {item.client ? (
                    <span className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" /> {item.client}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">No aplica</span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-500">
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