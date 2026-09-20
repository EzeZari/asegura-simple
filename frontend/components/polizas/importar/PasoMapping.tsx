"use client";

import { Link as LinkIcon } from "lucide-react";

interface Props {
  companiasDesconocidas: string[];
  ramasDesconocidas: string[];
  dnisDesconocidosFilas: any[];
  companiasDB: any[];
  aseguradosDB: any[];
  ramasPermitidas: string[];
  mapeosCompanias: Record<string, string>;
  setMapeosCompanias: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  mapeosRamas: Record<string, string>;
  setMapeosRamas: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  mapeosAsegurados: Record<number, string>;
  setMapeosAsegurados: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

export default function PasoMapping({
  companiasDesconocidas,
  ramasDesconocidas,
  dnisDesconocidosFilas,
  companiasDB,
  aseguradosDB,
  ramasPermitidas,
  mapeosCompanias,
  setMapeosCompanias,
  mapeosRamas,
  setMapeosRamas,
  mapeosAsegurados,
  setMapeosAsegurados,
}: Props) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-4 md:p-5 flex items-start gap-3">
        <LinkIcon size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">Ajuste de datos no reconocidos</h3>
          <p className="text-xs text-amber-800/80 dark:text-amber-200/70 leading-relaxed">
            Las compañías y ramas se corrigen <strong>una sola vez</strong> para todas las filas donde aparezcan. Los clientes desconocidos podés asignarlos fila por fila o ignorarlos.
          </p>
        </div>
      </div>

      <div className="space-y-6 max-h-[52vh] overflow-y-auto pr-2 custom-scrollbar">
        {/* 1. Mapeo de Compañías Desconocidas */}
        {companiasDesconocidas.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Compañías a Corregir ({companiasDesconocidas.length})
            </h4>
            {companiasDesconocidas.map((ciaOriginal) => (
              <div key={ciaOriginal} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Texto detectado en el Excel:</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 font-mono">"{ciaOriginal}"</span>
                </div>
                <select
                  value={mapeosCompanias[ciaOriginal] || "IGNORAR"}
                  onChange={(e) => setMapeosCompanias({ ...mapeosCompanias, [ciaOriginal]: e.target.value })}
                  className="w-full sm:w-72 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="IGNORAR" className="text-red-500 font-bold">❌ Ignorar (Rechazar pólizas)</option>
                  {companiasDB.map((c) => (
                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* 2. Mapeo de Ramas Desconocidas */}
        {ramasDesconocidas.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Ramas / Riesgos a Corregir ({ramasDesconocidas.length})
            </h4>
            {ramasDesconocidas.map((ramaOriginal) => (
              <div key={ramaOriginal} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Texto detectado en el Excel:</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 font-mono">"{ramaOriginal}"</span>
                </div>
                <select
                  value={mapeosRamas[ramaOriginal] || "IGNORAR"}
                  onChange={(e) => setMapeosRamas({ ...mapeosRamas, [ramaOriginal]: e.target.value })}
                  className="w-full sm:w-72 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="IGNORAR" className="text-red-500 font-bold">❌ Ignorar (Rechazar pólizas)</option>
                  {ramasPermitidas.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* 3. Mapeo de Clientes Inexistentes por Fila */}
        {dnisDesconocidosFilas.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Clientes Inexistentes por Fila ({dnisDesconocidosFilas.length})
            </h4>
            {dnisDesconocidosFilas.map((conf) => (
              <div key={conf.index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Póliza #{conf.poliza}</span>
                    <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 font-medium">Fila {conf.filaExcel}</span>
                  </div>
                  <span className="text-xs text-red-600 dark:text-red-400 mt-1">DNI no registrado: <strong>{conf.dniOriginal}</strong></span>
                </div>
                <select
                  value={mapeosAsegurados[conf.index] || "IGNORAR"}
                  onChange={(e) => setMapeosAsegurados({ ...mapeosAsegurados, [conf.index]: e.target.value })}
                  className="w-full sm:w-72 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="IGNORAR" className="text-red-500 font-bold">❌ Ignorar esta póliza</option>
                  {aseguradosDB.map((a) => (
                    <option key={a.id} value={a.dni}>{a.apellido ? `${a.apellido}, ${a.nombre}` : a.nombre} ({a.dni})</option>
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