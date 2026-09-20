"use client";

import { CheckCircle, AlertTriangle } from "lucide-react";

interface Props {
  asegurados: any[];
  currentAsegurados: any[];
  dnisExistentesDB: string[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  startIndex: number;
  itemsPerPage: number;
}

export default function PasoPreviewAsegurados({
  asegurados,
  currentAsegurados,
  dnisExistentesDB,
  currentPage,
  totalPages,
  setCurrentPage,
  startIndex,
  itemsPerPage,
}: Props) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4 flex items-start gap-3">
        <CheckCircle size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-bold text-blue-950 dark:text-blue-200">Revisión de clientes a ingresar</p>
          <p className="text-xs text-blue-800/70 dark:text-blue-300/70">
            Los clientes marcados en <strong className="text-red-500">rojo</strong> (DNI repetido o sin nombre) serán rechazados para preservar la integridad de tu cartera.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm flex flex-col">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Nombre / Razón Social</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Apellido</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">DNI / CUIT</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Tipo</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Condición IVA</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Contacto</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Dirección</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {currentAsegurados.map((c: any, i: number) => {
              const dniLimpio = String(c.dni || "").replace(/[^0-9]/g, "");
              const yaExisteEnDB = dnisExistentesDB.includes(dniLimpio);
              const faltaNombre = !c.nombre;
              const faltaDni = !dniLimpio;

              return (
                <tr key={i} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 text-gray-700 dark:text-gray-300 transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {faltaNombre ? <span className="text-red-500 italic">Sin Nombre</span> : c.nombre}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{c.apellido || <span className="text-gray-400 italic">-</span>}</td>
                  
                  <td className="px-4 py-3 whitespace-nowrap font-mono font-medium">
                    {faltaDni ? (
                      <span className="text-red-500 font-bold bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/40">Vacío</span>
                    ) : yaExisteEnDB ? (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/40 font-bold" title="Ya existe en tu sistema">
                        <AlertTriangle size={12} /> {dniLimpio} (Duplicado)
                      </span>
                    ) : (
                      <span>{dniLimpio}</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[11px] font-medium">
                      {c.tipo || "Individuo"}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">{c.condicionIva || "Consumidor Final"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{c.telefono || "-"}</span>
                      <span className="text-gray-400 text-[10px]">{c.email || "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap truncate max-w-[180px]">{c.direccion || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, asegurados.length)} de {asegurados.length} clientes
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 disabled:opacity-40 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Anterior
              </button>
              <span className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center">
                Pág {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 disabled:opacity-40 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}