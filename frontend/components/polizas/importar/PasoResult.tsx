"use client";

import { FileSpreadsheet, Check, Copy, FileDown } from "lucide-react";

interface Props {
  resultado: any;
  isCopied: boolean;
  onCopiarReporte: () => void;
  onDescargarErrores: () => void;
}

export default function PasoResult({ resultado, isCopied, onCopiarReporte, onDescargarErrores }: Props) {
  if (!resultado) return null;

  return (
    <div className="flex flex-col gap-6 py-2 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-3xl mx-auto">
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-5 text-center shadow-sm">
          <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{resultado.creados}</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-1 uppercase font-bold tracking-wider">Pólizas Importadas</p>
        </div>
        <div className={`rounded-2xl p-5 text-center border shadow-sm ${
          resultado.salteados > 0 
            ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30" 
            : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800"
        }`}>
          <p className={`text-4xl font-black ${resultado.salteados > 0 ? "text-red-600 dark:text-red-400" : "text-gray-400"}`}>{resultado.salteados}</p>
          <p className={`text-xs mt-1 uppercase font-bold tracking-wider ${resultado.salteados > 0 ? "text-red-700 dark:text-red-500" : "text-gray-400"}`}>Rechazadas</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 gap-3">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-gray-400" /> Log de Procesamiento
          </span>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {resultado.salteados > 0 && (
              <button 
                type="button"
                onClick={onDescargarErrores}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold transition-all"
              >
                <FileDown size={14} /> Descargar Fallidas (.xlsx)
              </button>
            )}
            <button 
              type="button"
              onClick={onCopiarReporte}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all"
            >
              {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {isCopied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
        
        <div className="max-h-[260px] overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {resultado.reporte?.map((item: any, idx: number) => (
            <div key={idx} className={`text-xs p-2.5 rounded-xl flex items-start gap-3 border ${
              item.estado === "exito" 
                ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-800 dark:text-emerald-300" 
                : "bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900/20 text-red-800 dark:text-red-300"
            }`}>
              <span className="shrink-0 mt-0.5">{item.estado === "exito" ? "✅" : "❌"}</span>
              <div className="flex flex-col gap-0.5">
                <p><strong className="font-mono text-[10px] bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded mr-1">Fila {item.fila}</strong> Póliza #{item.poliza}</p>
                <p className={`font-medium ${item.estado === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>{item.motivo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}