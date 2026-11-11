"use client";

import { useRef, useState, useEffect } from "react";
import { Sparkles, Loader2, AlertCircle, Crown, CheckCircle2 } from "lucide-react";
import { ScanResultado } from "./polizaModal.types";

interface Props {
  isScanning: boolean;
  disabled: boolean;
  errorLimitePlan: string;
  scanResultado: ScanResultado | null;
  onSelectFile: (file: File) => void;
  onUpgradeClick?: () => void;
}

export default function PolizaScannerBanner({
  isScanning,
  disabled,
  errorLimitePlan,
  scanResultado,
  onSelectFile,
  onUpgradeClick,
}: Props) {
  const aiInputRef = useRef<HTMLInputElement>(null);
  
  // 🔥 ESTADO PARA EL MENSAJE ROTATIVO DEL BOTÓN
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const loadingMessages = [
    "Leyendo PDF...",
    "Extrayendo datos...",
    "Buscando asegurado...",
    "Procesando coberturas..."
  ];

  // 🔥 EFECTO PARA ROTAR EL TEXTO MIENTRAS ESCANEA
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning) {
      setLoadingTextIndex(0); // Reiniciamos al empezar
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000); // Cambia el texto cada 3 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onSelectFile(e.target.files[0]);
      if (aiInputRef.current) aiInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-gray-800 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex flex-col gap-3 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Autocompletar con PDF
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                Lectura IA
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Subí el PDF de la póliza para extraer vigencia, refacturación y datos del riesgo automáticamente.
            </p>
          </div>
        </div>

        <input
          type="file"
          ref={aiInputRef}
          onChange={handleInputChange}
          accept="application/pdf"
          className="hidden"
        />
        <button
          type="button"
          disabled={isScanning || disabled}
          onClick={() => aiInputRef.current?.click()}
          className={`shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-80 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer ${
            isScanning ? "w-48" : "" // Mantiene un ancho fijo para que el botón no salte al cambiar el texto
          }`}
        >
          {isScanning ? (
            <>
              <Loader2 size={16} className="animate-spin shrink-0" />
              <span className="truncate w-full text-center animate-in fade-in zoom-in duration-300">
                {loadingMessages[loadingTextIndex]}
              </span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Escanear Póliza PDF
            </>
          )}
        </button>
      </div>

      {errorLimitePlan && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span className="font-medium leading-relaxed">{errorLimitePlan}</span>
          </div>
          {onUpgradeClick && (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
            >
              <Crown size={14} />
              Mejorar Plan
            </button>
          )}
        </div>
      )}

      {scanResultado && (
        <div className="bg-white/80 dark:bg-gray-900/60 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 flex flex-col gap-1.5 text-xs animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              {scanResultado.mensaje}
            </span>
            {scanResultado.usos && (
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                Lecturas este mes: {scanResultado.usos.escaneosUsados}/{scanResultado.usos.limitePlan}
              </span>
            )}
          </div>
          {scanResultado.avisos.length > 0 && (
            <ul className="list-disc pl-4 space-y-1 text-amber-700 dark:text-amber-400 font-medium mt-1">
              {scanResultado.avisos.map((aviso, idx) => (
                <li key={idx}>{aviso}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}