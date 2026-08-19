"use client";

import { CarFront, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SiniestroRiesgoCard({ poliza }: { poliza: any }) {
  const router = useRouter();

  if (!poliza) return null;

  return (
    <div className="p-5 md:p-6 border border-gray-100 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800 shadow-sm flex flex-col gap-4 transition-colors">
      <h3 className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px] md:text-xs tracking-widest border-b border-gray-50 dark:border-gray-700 pb-2 transition-colors">
        Riesgo Cubierto
      </h3>
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 shrink-0 transition-colors">
            <CarFront size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase transition-colors">Rama</p>
            <p className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-100 break-words transition-colors">{poliza.tipoPoliza}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50/50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100/70 dark:border-gray-700/70 transition-colors">
            <span className="block text-gray-400 dark:text-gray-500 font-medium mb-0.5 text-[10px] md:text-xs transition-colors">Nro Póliza</span>
            <span className="font-bold text-gray-800 dark:text-gray-200 text-xs md:text-sm transition-colors">#{poliza.nroPoliza}</span>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100/70 dark:border-gray-700/70 transition-colors">
            <span className="block text-gray-400 dark:text-gray-500 font-medium mb-0.5 text-[10px] md:text-xs transition-colors">Patente</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white uppercase bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 shadow-xs text-xs md:text-sm transition-colors">
              {poliza.patente || "N/A"}
            </span>
          </div>
        </div>

        {(poliza.marca || poliza.modelo || poliza.cobertura) && (
          <div className="bg-gray-50/30 dark:bg-gray-900/30 p-3 md:p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-2 text-[10px] md:text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors">
            {poliza.marca && <p><span className="text-gray-400 dark:text-gray-500">Vehículo:</span> {poliza.marca} {poliza.modelo}</p>}
            {poliza.cobertura && <p><span className="text-gray-400 dark:text-gray-500">Cobertura:</span> {poliza.cobertura}</p>}
          </div>
        )}

        {/* 🔥 EL NUEVO BOTÓN DE ACCESO DIRECTO A LA PÓLIZA */}
        <button 
          onClick={() => router.push(`/polizas/${poliza.id}`)}
          className="mt-2 flex items-center justify-center gap-2 w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-bold text-xs md:text-sm transition-colors shadow-sm active:scale-95"
        >
          Ver detalle de la Póliza <ArrowRight size={16} />
        </button>

      </div>
    </div>
  );
}