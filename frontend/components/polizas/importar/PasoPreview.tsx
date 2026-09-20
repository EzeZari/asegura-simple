"use client";

import { CheckCircle, UserX, CalendarX } from "lucide-react";

interface Props {
  polizas: any[];
  currentPolizas: any[];
  aseguradosDB: any[];
  companiasDB: any[];
  ramasPermitidas: string[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  startIndex: number;
  itemsPerPage: number;
}

export default function PasoPreview({
  polizas,
  currentPolizas,
  aseguradosDB,
  companiasDB,
  ramasPermitidas,
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
          <p className="text-sm font-bold text-blue-950 dark:text-blue-200">Revisión previa a la importación</p>
          <p className="text-xs text-blue-800/70 dark:text-blue-300/70">
            Las celdas en <strong className="text-red-500">rojo</strong> indican errores que serán ignorados. Las celdas en <strong className="text-amber-500">amarillo</strong> serán completadas con valores por defecto.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm flex flex-col">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Nro Póliza</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">DNI/CUIT</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Compañía</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Rama</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Patente</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Vigencia Desde</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Vigencia Hasta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {currentPolizas.map((p: any, i: number) => {
              const dniLimpio = String(p.dnicuit || "").replace(/[^0-9]/g, "");
              const dniExiste = aseguradosDB.some((a) => String(a.dni).replace(/[^0-9]/g, "") === dniLimpio);

              const ciaValor = String(p.compania || "");
              const ciaExiste = companiasDB.some((c) => c.nombre.toLowerCase() === ciaValor.toLowerCase());

              const ramaValor = String(p.ramariesgo || "");
              const ramaExiste = ramasPermitidas.some((r) => r.toLowerCase() === ramaValor.toLowerCase());

              const faltaDesde = !p.vigenciadesde;
              const faltaHasta = !p.vigenciahasta;

              let fechasInvertidas = false;
              if (p.vigenciadesde && p.vigenciahasta) {
                const d = new Date(p.vigenciadesde);
                const h = new Date(p.vigenciahasta);
                if (!isNaN(d.getTime()) && !isNaN(h.getTime()) && h <= d) {
                  fechasInvertidas = true;
                }
              }

              return (
                <tr key={i} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 text-gray-700 dark:text-gray-300 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {p.nropoliza || <span className="text-red-500 italic">Vacío</span>}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {dniExiste && dniLimpio ? (
                      <span>{dniLimpio}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/40 font-bold">
                        <UserX size={12} /> {dniLimpio || "Ignorado"}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {ciaExiste && ciaValor ? (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">{ciaValor}</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/40 font-bold">Ignorada</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {ramaExiste && ramaValor ? (
                      <span>{ramaValor}</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/40 font-bold">Inválida</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap font-mono">
                    {p.patente ? p.patente : <span className="text-gray-400 dark:text-gray-600">-</span>}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {faltaDesde ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/40 font-medium">
                        <CalendarX size={12} /> Hoy
                      </span>
                    ) : (
                      <span>{String(p.vigenciadesde)}</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {fechasInvertidas ? (
                      <span className="text-red-600 dark:text-red-400 font-bold" title="El vencimiento es menor al inicio">
                        ⚠️ {String(p.vigenciahasta)}
                      </span>
                    ) : faltaHasta ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/40 font-medium">
                        <CalendarX size={12} /> +6 Meses
                      </span>
                    ) : (
                      <span>{String(p.vigenciahasta)}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, polizas.length)} de {polizas.length} filas
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