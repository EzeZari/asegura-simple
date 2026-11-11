"use client";

import { useRef } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

interface Props {
  pdfFile: File | null;
  cuponeraFile: File | null;
  enviarCuponera: boolean;
  existingPdfUrl?: string;
  existingCuponeraUrl?: string;
  onPdfSelect: (file: File | null) => void;
  onCuponeraSelect: (file: File | null) => void;
  onEnviarCuponeraChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onError: (msg: string) => void;
}

export default function PolizaArchivosSection({
  pdfFile,
  cuponeraFile,
  enviarCuponera,
  existingPdfUrl,
  existingCuponeraUrl,
  onPdfSelect,
  onCuponeraSelect,
  onEnviarCuponeraChange,
  onError,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cuponeraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        onError("El archivo de la póliza es muy pesado. Máximo 20 MB.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.type !== "application/pdf") {
        onError("Solo se permiten archivos en formato PDF.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      onPdfSelect(file);
      onError("");
    }
  };

  const handleCuponeraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        onError("El archivo de la cuponera es muy pesado. Máximo 20 MB.");
        if (cuponeraInputRef.current) cuponeraInputRef.current.value = "";
        return;
      }
      if (file.type !== "application/pdf") {
        onError("Solo se permiten archivos en formato PDF para la cuponera.");
        if (cuponeraInputRef.current) cuponeraInputRef.current.value = "";
        return;
      }
      onCuponeraSelect(file);
      onError("");
    }
  };

  return (
    <>
      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4 transition-colors">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 transition-colors">
          Póliza Digital{" "}
          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full normal-case transition-colors">
            Opcional
          </span>
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            <UploadCloud size={18} />
            {pdfFile ? "Cambiar archivo" : "Adjuntar PDF"}
          </button>
          {pdfFile && (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800/30 transition-colors">
              <FileText size={16} />
              <span className="font-medium truncate max-w-[200px]">{pdfFile.name}</span>
              <button
                type="button"
                onClick={() => {
                  onPdfSelect(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="ml-2 text-green-600 dark:text-green-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {!pdfFile && existingPdfUrl && (
            <span className="text-sm text-gray-500 dark:text-gray-400 italic transition-colors">
              Ya tiene un PDF guardado.
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4 transition-colors">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 transition-colors">
          Cuponera de Pago{" "}
          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full normal-case transition-colors">
            Opcional
          </span>
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input
            type="file"
            ref={cuponeraInputRef}
            onChange={handleCuponeraChange}
            accept="application/pdf"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => cuponeraInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            <UploadCloud size={18} />
            {cuponeraFile ? "Cambiar Cuponera" : "Adjuntar Cuponera"}
          </button>
          {cuponeraFile && (
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/30 transition-colors">
              <FileText size={16} />
              <span className="font-medium truncate max-w-[200px]">{cuponeraFile.name}</span>
              <button
                type="button"
                onClick={() => {
                  onCuponeraSelect(null);
                  if (cuponeraInputRef.current) cuponeraInputRef.current.value = "";
                }}
                className="ml-2 text-blue-600 dark:text-blue-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {!cuponeraFile && existingCuponeraUrl && (
            <span className="text-sm text-gray-500 dark:text-gray-400 italic transition-colors">
              Ya tiene una cuponera guardada.
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors">
          <input
            type="checkbox"
            id="enviarCuponera"
            name="enviarCuponera"
            checked={Boolean(enviarCuponera)}
            onChange={onEnviarCuponeraChange}
            className="w-4 h-4 text-green-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-green-600 dark:focus:ring-green-500 transition-colors"
          />
          <label
            htmlFor="enviarCuponera"
            className="text-sm text-gray-700 dark:text-gray-300 font-medium cursor-pointer leading-tight transition-colors"
          >
            Adjuntar automáticamente esta cuponera en el correo de aviso de vencimiento.
          </label>
        </div>
      </div>
    </>
  );
}