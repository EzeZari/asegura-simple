"use client";

import { useRef, useState } from "react";
import { FileText, UploadCloud, Loader2, X, Receipt } from "lucide-react";
import { apiFetch } from "@/services/api";

interface Props {
  poliza: any;
  puedeModificar: boolean;
  onSuccess: (mensaje: string) => void;
  onError: (mensaje: string) => void;
}

export default function PolizaDocumentos({ poliza, puedeModificar, onSuccess, onError }: Props) {
  const [isUploading, setIsUploading] = useState<"pdf" | "cuponera" | null>(null);
  
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const cuponeraInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: "pdf" | "cuponera") => {
    if (!puedeModificar) return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      onError(`Solo se permiten archivos en formato PDF para ${tipo}.`);
      return;
    }

    setIsUploading(tipo);
    const formData = new FormData();
    formData.append(tipo, file);

    try {
      const res = await apiFetch(`/api/polizas/${poliza.id}/subir-pdf`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir el archivo");

      onSuccess(`Documento (${tipo.toUpperCase()}) guardado con éxito.`);
    } catch (error: any) {
      onError(error.message);
    } finally {
      setIsUploading(null);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className="p-5 md:p-8 border border-gray-100 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800 shadow-sm transition-colors flex flex-col gap-6">
      <h3 className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px] md:text-xs tracking-widest border-b border-gray-50 dark:border-gray-700 pb-2 transition-colors">
        Documentación Digital
      </h3>

      {/* BLOQUE: PÓLIZA PRINCIPAL */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-colors">
          <FileText size={14} className="text-blue-600 dark:text-blue-400" /> Póliza Original
        </h4>
        
        <input type="file" ref={pdfInputRef} onChange={(e) => handleUpload(e, "pdf")} accept="application/pdf" className="hidden" />

        {poliza.pdfUrl ? (
          <div className="flex flex-col gap-2">
            <a 
              href={poliza.pdfUrl.startsWith('http') ? poliza.pdfUrl : `${process.env.NEXT_PUBLIC_API_URL}/${poliza.pdfUrl}`}
              target="_blank" rel="noopener noreferrer"
              className="flex justify-center items-center gap-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 py-3 rounded-xl font-bold transition-colors text-sm"
            >
              <FileText size={16} /> Ver Póliza PDF
            </a>
            {puedeModificar && (
              <button onClick={() => pdfInputRef.current?.click()} disabled={isUploading === "pdf"} className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
                {isUploading === "pdf" ? "Subiendo..." : "Reemplazar archivo"}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {puedeModificar ? (
              <button onClick={() => pdfInputRef.current?.click()} disabled={isUploading === "pdf"} className="flex flex-col justify-center items-center gap-1.5 border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 dark:text-gray-400 py-4 rounded-xl font-medium transition-all text-xs">
                {isUploading === "pdf" ? <Loader2 size={20} className="animate-spin text-blue-600 dark:text-blue-500" /> : <UploadCloud size={20} />}
                {isUploading === "pdf" ? "Procesando..." : "Subir Póliza (PDF)"}
              </button>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500 italic">No cargada.</span>
            )}
          </div>
        )}
      </div>

      {/* BLOQUE: CUPONERA DE PAGO */}
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-50 dark:border-gray-700 transition-colors">
        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-colors">
          <Receipt size={14} className="text-orange-600 dark:text-orange-400" /> Cuponera de Pago
        </h4>
        
        <input type="file" ref={cuponeraInputRef} onChange={(e) => handleUpload(e, "cuponera")} accept="application/pdf" className="hidden" />

        {poliza.cuponeraUrl ? (
          <div className="flex flex-col gap-2">
            <a 
              href={poliza.cuponeraUrl.startsWith('http') ? poliza.cuponeraUrl : `${process.env.NEXT_PUBLIC_API_URL}/${poliza.cuponeraUrl}`}
              target="_blank" rel="noopener noreferrer"
              className="flex justify-center items-center gap-2 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 py-3 rounded-xl font-bold transition-colors text-sm"
            >
              <Receipt size={16} /> Ver Cuponera
            </a>
            {puedeModificar && (
              <button onClick={() => cuponeraInputRef.current?.click()} disabled={isUploading === "cuponera"} className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
                {isUploading === "cuponera" ? "Subiendo..." : "Reemplazar archivo"}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {puedeModificar ? (
              <button onClick={() => cuponeraInputRef.current?.click()} disabled={isUploading === "cuponera"} className="flex flex-col justify-center items-center gap-1.5 border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-gray-500 dark:text-gray-400 py-4 rounded-xl font-medium transition-all text-xs">
                {isUploading === "cuponera" ? <Loader2 size={20} className="animate-spin text-orange-600 dark:text-orange-500" /> : <UploadCloud size={20} />}
                {isUploading === "cuponera" ? "Procesando..." : "Subir Cuponera (PDF)"}
              </button>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500 italic">No cargada.</span>
            )}
          </div>
        )}
      </div>

    </div>
  );
}