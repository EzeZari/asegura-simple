"use client";

import { Link as LinkIcon } from "lucide-react";

interface Props {
  condicionesDesconocidas: string[];
  tiposDesconocidos: string[];
  mapeosCondicionIva: Record<string, string>;
  setMapeosCondicionIva: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  mapeosTipos: Record<string, string>;
  setMapeosTipos: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const CONDICIONES_IVA = ["Consumidor Final", "Monotributo", "Responsable Inscripto", "Exento"];
const TIPOS_CLIENTE = ["Individuo", "Empresa"];

export default function PasoMappingAsegurados({
  condicionesDesconocidas,
  tiposDesconocidos,
  mapeosCondicionIva,
  setMapeosCondicionIva,
  mapeosTipos,
  setMapeosTipos,
}: Props) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-4 md:p-5 flex items-start gap-3">
        <LinkIcon size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">Ajuste de datos fiscales y tipos</h3>
          <p className="text-xs text-amber-800/80 dark:text-amber-200/70 leading-relaxed">
            Detectamos valores en tu Excel que no coinciden exactamente con los registros del sistema. Seleccioná su equivalencia para que se aplique a todas las filas.
          </p>
        </div>
      </div>

      <div className="space-y-6 max-h-[52vh] overflow-y-auto pr-2 custom-scrollbar">
        {condicionesDesconocidas.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Condición IVA a Normalizar ({condicionesDesconocidas.length})
            </h4>
            {condicionesDesconocidas.map((iva) => (
              <div key={iva} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Texto en tu planilla:</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 font-mono">"{iva}"</span>
                </div>
                <select
                  value={mapeosCondicionIva[iva] || "Consumidor Final"}
                  onChange={(e) => setMapeosCondicionIva({ ...mapeosCondicionIva, [iva]: e.target.value })}
                  className="w-full sm:w-72 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CONDICIONES_IVA.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {tiposDesconocidos.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Tipo de Cliente a Normalizar ({tiposDesconocidos.length})
            </h4>
            {tiposDesconocidos.map((tipo) => (
              <div key={tipo} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Texto en tu planilla:</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 font-mono">"{tipo}"</span>
                </div>
                <select
                  value={mapeosTipos[tipo] || "Individuo"}
                  onChange={(e) => setMapeosTipos({ ...mapeosTipos, [tipo]: e.target.value })}
                  className="w-full sm:w-72 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {TIPOS_CLIENTE.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}