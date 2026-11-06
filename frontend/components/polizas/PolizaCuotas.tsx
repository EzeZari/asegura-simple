"use client";

import { useState } from "react";
import { CheckSquare, Square, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { apiFetch } from "@/services/api";

interface Props {
  poliza: any;
  puedeModificar: boolean;
  onUpdate?: () => void; 
}

export default function PolizaCuotas({ poliza, puedeModificar, onUpdate }: Props) {
  const [cuotas, setCuotas] = useState<any[]>(poliza.estadoCuotas || []);
  const [isSaving, setIsSaving] = useState(false);

  if (!cuotas || cuotas.length === 0) return null;

  const toggleCuota = async (idCuota: number) => {
    if (!puedeModificar || isSaving) return;
    setIsSaving(true);

    const nuevasCuotas = cuotas.map((c: any) => {
      if (c.id === idCuota) {
        const estaPagado = c.estado === 'Pagado' || c.estado === 'Al día' || c.pagado === true;
        return { 
          ...c, 
          estado: estaPagado ? 'Pendiente' : 'Pagado',
          pagado: !estaPagado 
        };
      }
      return c;
    });

    // Actualización optimista (rápida) en el cuadradito
    setCuotas(nuevasCuotas);

    try {
      const res = await apiFetch(`/api/polizas/${poliza.id}`, {
        method: "PUT",
        body: JSON.stringify({ estadoCuotas: nuevasCuotas }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      
      // 🔥 Le avisamos a la página principal que actualice la póliza para refrescar el cartel de "Al día"
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error("Error actualizando cuota", error);
      setCuotas(poliza.estadoCuotas); // Revertimos si hay error
    } finally {
      setIsSaving(false);
    }
  };

  const pagadas = cuotas.filter((c: any) => c.estado === 'Pagado' || c.estado === 'Al día' || c.pagado === true).length;
  const progreso = Math.round((pagadas / cuotas.length) * 100);

  const getStylePorEstado = (cuota: any) => {
    if (cuota.estado === 'Pagado' || cuota.estado === 'Al día' || cuota.pagado === true) {
      return 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30 text-blue-900 dark:text-blue-300';
    }
    if (cuota.estado === 'Vencido') {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-900 dark:text-red-300 hover:border-red-300';
    }
    return 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300';
  };

  return (
    <div className="p-5 md:p-8 border border-gray-100 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard size={20} className="text-blue-600 dark:text-blue-500" /> Seguimiento de Refacturación
          </h3>
          {poliza.frecuenciaRefacturacion && (
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 font-medium">
               Modalidad: {poliza.frecuenciaRefacturacion} 
               {poliza.diaHabitualPago ? ` (Día ${poliza.diaHabitualPago})` : ""}
             </p>
          )}
        </div>
        {isSaving && <Loader2 size={16} className="text-gray-400 animate-spin" />}
      </div>

      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
        <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progreso}%` }}></div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">
        {pagadas} de {cuotas.length} períodos pagados ({progreso}%)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cuotas.map((cuota: any) => {
           const isPagada = cuota.estado === 'Pagado' || cuota.estado === 'Al día' || cuota.pagado === true;
           const isVencida = cuota.estado === 'Vencido';
           
           return (
            <div 
              key={cuota.id}
              onClick={() => toggleCuota(cuota.id)}
              className={`flex flex-col p-3 rounded-xl border transition-all cursor-pointer select-none
                ${getStylePorEstado(cuota)}
                ${(!puedeModificar || isSaving) ? 'pointer-events-none opacity-70' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold truncate pr-2">{cuota.mes}</span>
                {isPagada 
                  ? <CheckSquare size={18} className="text-blue-600 dark:text-blue-500 shrink-0" /> 
                  : <Square size={18} className={`${isVencida ? 'text-red-400' : 'text-gray-300 dark:text-gray-600'} shrink-0`} />
                }
              </div>
              <div className="flex justify-between items-center mt-1">
                {cuota.fechaVencimiento && (
                  <span className="text-[10px] font-medium opacity-70">
                    Vto: {new Date(cuota.fechaVencimiento).toLocaleDateString("es-AR").slice(0, 5)}
                  </span>
                )}
                {isVencida && (
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={10} /> VENCIDO
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}