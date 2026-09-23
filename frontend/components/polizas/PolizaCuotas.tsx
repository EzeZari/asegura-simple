"use client";

import { useState } from "react";
import { CheckSquare, Square, CreditCard, Loader2 } from "lucide-react";
import { apiFetch } from "@/services/api";

interface Props {
  poliza: any;
  puedeModificar: boolean;
}

export default function PolizaCuotas({ poliza, puedeModificar }: Props) {
  const [cuotas, setCuotas] = useState<any[]>(poliza.estadoCuotas || []);
  const [isSaving, setIsSaving] = useState(false);

  // Si no hay cuotas generadas, no mostramos nada
  if (!cuotas || cuotas.length === 0) return null;

  const toggleCuota = async (idCuota: number) => {
    if (!puedeModificar || isSaving) return;
    setIsSaving(true);

    const nuevasCuotas = cuotas.map((c: any) => 
      c.id === idCuota ? { ...c, pagado: !c.pagado } : c
    );

    // Actualización optimista en pantalla
    setCuotas(nuevasCuotas);

    try {
      const res = await apiFetch(`/api/polizas/${poliza.id}`, {
        method: "PUT",
        body: JSON.stringify({ estadoCuotas: nuevasCuotas }),
      });
      if (!res.ok) throw new Error("Error al guardar");
    } catch (error) {
      console.error("Error actualizando cuota", error);
      // Si falla, revertimos
      setCuotas(poliza.estadoCuotas);
    } finally {
      setIsSaving(false);
    }
  };

  const pagadas = cuotas.filter((c: any) => c.pagado).length;
  const progreso = Math.round((pagadas / cuotas.length) * 100);

  return (
    <div className="p-5 md:p-8 border border-gray-100 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard size={20} className="text-blue-600 dark:text-blue-500" /> Control de Pagos
        </h3>
        {isSaving && <Loader2 size={16} className="text-gray-400 animate-spin" />}
      </div>

      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
        <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progreso}%` }}></div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">
        {pagadas} de {cuotas.length} cuotas pagadas ({progreso}%)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cuotas.map((cuota: any) => (
          <div 
            key={cuota.id}
            onClick={() => toggleCuota(cuota.id)}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none
              ${cuota.pagado 
                ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30 text-blue-900 dark:text-blue-300' 
                : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300'
              }
              ${(!puedeModificar || isSaving) ? 'pointer-events-none opacity-70' : ''}
            `}
          >
            <span className="text-sm font-bold truncate pr-2">{cuota.mes}</span>
            {cuota.pagado 
              ? <CheckSquare size={18} className="text-blue-600 dark:text-blue-500 shrink-0" /> 
              : <Square size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />
            }
          </div>
        ))}
      </div>
    </div>
  );
}