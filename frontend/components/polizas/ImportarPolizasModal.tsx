"use client";

import { useState, useRef } from "react";
import { X, UploadCloud, FileSpreadsheet, AlertTriangle, Loader2, CheckCircle2, Info } from "lucide-react";
import * as XLSX from "xlsx";
import { apiFetch } from "@/services/api"; 

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mensaje: string) => void;
}

export default function ImportarPolizasModal({ isOpen, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (extension !== 'xlsx' && extension !== 'xls' && extension !== 'csv') {
      setError("Formato no válido. Subí un archivo .xlsx, .xls o .csv");
      return;
    }

    setError("");
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false }); 
        setPreviewData(json);
      } catch (err) {
        setError("Error al leer la estructura del archivo.");
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    setIsProcessing(true);
    setError("");

    try {
      const res = await apiFetch(`/api/polizas/importar`, {
        method: "POST",
        body: JSON.stringify(previewData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en la carga.");

      onSuccess(`¡Éxito! Se importaron ${data.creados} pólizas (se omitieron ${data.salteados} por falta de DNI o duplicados).`);
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl shadow-xl relative animate-in fade-in zoom-in duration-200 border border-transparent dark:border-gray-700 transition-colors">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
            <FileSpreadsheet size={22} className="text-green-700 dark:text-green-500" /> Importar Pólizas
          </h2>
          <button onClick={handleClose} disabled={isProcessing} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          
          <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 transition-colors">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2 mb-2 transition-colors">
              <Info size={16} /> Estructura recomendada
            </h3>
            <p className="text-xs text-blue-800 dark:text-blue-300 mb-3 leading-relaxed transition-colors">
              Tu archivo Excel debe tener las siguientes columnas. Para que la póliza se asigne correctamente, <strong className="font-black">el DNI del Asegurado ya debe existir en tu lista de clientes</strong>.
            </p>
            <div className="overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-800/30 bg-white dark:bg-gray-800 transition-colors custom-scrollbar">
              <table className="w-full text-left text-[10px] text-gray-600 dark:text-gray-300 whitespace-nowrap">
                <thead className="bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300 font-bold uppercase transition-colors">
                  <tr>
                    <th className="px-3 py-2 border-r border-blue-100 dark:border-gray-700">Nro Póliza *</th>
                    <th className="px-3 py-2 border-r border-blue-100 dark:border-gray-700">DNI / CUIT *</th>
                    <th className="px-3 py-2 border-r border-blue-100 dark:border-gray-700">Compañía</th>
                    <th className="px-3 py-2 border-r border-blue-100 dark:border-gray-700">Rama / Riesgo</th>
                    <th className="px-3 py-2 border-r border-blue-100 dark:border-gray-700">Vigencia Desde</th>
                    <th className="px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 border-r border-gray-100 dark:border-gray-700 font-bold text-emerald-600 dark:text-emerald-500">3232232</td>
                    <td className="px-3 py-2 border-r border-gray-100 dark:border-gray-700 font-mono">44576382</td>
                    <td className="px-3 py-2 border-r border-gray-100 dark:border-gray-700">San Cristobal</td>
                    <td className="px-3 py-2 border-r border-gray-100 dark:border-gray-700">Automotor</td>
                    <td className="px-3 py-2 border-r border-gray-100 dark:border-gray-700">14/6/2026</td>
                    <td className="px-3 py-2 font-medium">Vigente</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"><AlertTriangle size={16}/> {error}</div>}

          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-green-50/30 dark:hover:bg-green-900/20 p-6 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
            >
              <UploadCloud size={32} className="text-gray-400 dark:text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors" />
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors">Hacé clic para seleccionar planilla</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 transition-colors">Soporta .xlsx, .xls o .csv</p>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls, .csv" className="hidden" />
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg transition-colors">
                  <FileSpreadsheet size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate transition-colors">{file.name}</p>
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium mt-0.5 flex items-center gap-1 transition-colors">
                    <CheckCircle2 size={12}/> {previewData.length} filas detectadas
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setFile(null); setPreviewData([]); }} 
                className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold px-2 py-1 bg-red-50 dark:bg-red-900/30 rounded-lg transition-colors shrink-0"
              >
                Cambiar
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-xl border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 transition-colors">
          <button onClick={handleClose} disabled={isProcessing} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleImport}
            disabled={previewData.length === 0 || isProcessing}
            className="px-4 py-2 bg-green-700 hover:bg-green-800 disabled:opacity-40 text-white rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {isProcessing ? "Importando..." : "Importar Pólizas"}
          </button>
        </div>

      </div>
    </div>
  );
}