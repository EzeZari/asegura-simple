"use client";

import { useState, useRef } from "react";
import { X, UploadCloud, FileSpreadsheet, AlertTriangle, Loader2, CheckCircle2, Info } from "lucide-react";
import * as XLSX from "xlsx";
import { apiFetch } from "@/services/api"; 
import { useAuthStore } from "@/store/authStore"; // 🔥 IMPORTAMOS EL STORE GLOBAL

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mensaje: string) => void;
}

export default function ImportarAseguradosModal({ isOpen, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 TRAEMOS LA FUNCIÓN GLOBAL EN LUGAR DE ESTADOS LOCALES
  const setShowUpgradeModal = useAuthStore((state) => state.setShowUpgradeModal);

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
      const res = await apiFetch(`/api/asegurados/importar`, {
        method: "POST",
        body: JSON.stringify(previewData),
      });

      const data = await res.json();

      // 🔥 ATRAPAMOS EL ERROR 403 Y DISPARAMOS EL MODAL GLOBAL
      if (res.status === 403 && data.codigo === "LIMITE_EXCEDIDO") {
        setShowUpgradeModal(true, data.error);
        setIsProcessing(false);
        handleClose(); // Cerramos esta ventana de importación
        return; 
      }

      if (!res.ok) throw new Error(data.error || "Error en la carga.");

      onSuccess(`¡Éxito! Se crearon ${data.creados} clientes nuevos (${data.salteados} ya existían o tenían DNI duplicado).`);
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl relative animate-in fade-in zoom-in duration-200">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet size={22} className="text-green-700" /> Importar desde Excel
          </h2>
          <button onClick={handleClose} disabled={isProcessing} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
            <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-2">
              <Info size={16} /> ¿Cómo preparar tu Excel?
            </h3>
            <p className="text-xs text-blue-800 mb-3 leading-relaxed">
              Para que el sistema lea bien tus datos, asegurate de que la primera fila tenga estos títulos (no importa si están en mayúsculas). <strong>Nombre</strong> y <strong>DNI</strong> son obligatorios:
            </p>
            <div className="overflow-hidden rounded-lg border border-blue-200 bg-white">
              <table className="w-full text-left text-[10px] text-gray-600">
                <thead className="bg-blue-50 text-blue-900 font-bold uppercase">
                  <tr>
                    <th className="px-3 py-2 border-r border-blue-100">Nombre *</th>
                    <th className="px-3 py-2 border-r border-blue-100">Apellido</th>
                    <th className="px-3 py-2 border-r border-blue-100">DNI *</th>
                    <th className="px-3 py-2 border-r border-blue-100">Telefono</th>
                    <th className="px-3 py-2">Email</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 border-r border-gray-100 font-medium">Juan Perez</td>
                    <td className="px-3 py-2 border-r border-gray-100 text-gray-400 italic">(Opcional)</td>
                    <td className="px-3 py-2 border-r border-gray-100 font-medium font-mono">32111222</td>
                    <td className="px-3 py-2 border-r border-gray-100">341555666</td>
                    <td className="px-3 py-2">juan@mail.com</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-blue-700 mt-2 italic">
              * Nota: Si el cliente ya existe (mismo DNI), el sistema lo ignorará para no duplicarlo.
            </p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2"><AlertTriangle size={16}/> {error}</div>}

          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-green-500 bg-gray-50/50 hover:bg-green-50/30 p-6 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
            >
              <UploadCloud size={32} className="text-gray-400 group-hover:text-green-600 transition-colors" />
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">Hacé clic para seleccionar tu planilla</p>
                <p className="text-xs text-gray-400 mt-1">Soporta formatos .xlsx, .xls o .csv</p>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls, .csv" className="hidden" />
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-green-100 text-green-700 rounded-lg">
                  <FileSpreadsheet size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-green-700 font-medium mt-0.5 flex items-center gap-1">
                    <CheckCircle2 size={12}/> {previewData.length} clientes detectados listos para importar
                  </p>
                </div>
              </div>
              {!isProcessing && (
                <button onClick={() => { setFile(null); setPreviewData([]); }} className="text-gray-400 hover:text-red-500 p-1 font-bold text-xs">
                  Cambiar
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50/50 rounded-b-xl border-t border-gray-100 flex justify-end gap-3">
          <button onClick={handleClose} disabled={isProcessing} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleImport}
            disabled={previewData.length === 0 || isProcessing}
            className="px-4 py-2 bg-green-700 hover:bg-green-800 disabled:opacity-40 text-white rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2 active:scale-95"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {isProcessing ? "Importando..." : "Importar Clientes"}
          </button>
        </div>

      </div>
    </div>
  );
}