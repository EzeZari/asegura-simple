"use client";

import { useState } from "react";
import { UploadCloud, X, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface ImportarCompaniasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mensaje: string) => void;
}

export default function ImportarCompaniasModal({ isOpen, onClose, onSuccess }: ImportarCompaniasModalProps) {
  const [paso, setPaso] = useState<1 | 2>(1);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [datosPreview, setDatosPreview] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorTexto, setErrorTexto] = useState("");

  if (!isOpen) return null;

  const resetearModal = () => {
    setPaso(1);
    setArchivo(null);
    setDatosPreview([]);
    setErrorTexto("");
    setIsLoading(false);
    onClose();
  };

  const handleSubirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorTexto("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setErrorTexto("Por favor, subí un archivo Excel válido (.xlsx o .xls)");
      return;
    }

    setArchivo(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[];
        
        const rows = data.filter(row => row.length > 0).slice(1);

        if (rows.length === 0) {
          setErrorTexto("El archivo está vacío o no tiene datos después de la fila de títulos.");
          return;
        }

        const mapeados = rows.map((row: any) => ({
          nombre: row[0]?.toString().trim() || "",
          cuit: row[1]?.toString().trim() || null,
          telefonoSiniestros: row[2]?.toString().trim() || null,
          email: row[3]?.toString().trim() || null
        })).filter(c => c.nombre !== ""); 

        if (mapeados.length === 0) {
          setErrorTexto("No se encontró ninguna compañía válida. Asegurate de que la primera columna contenga los Nombres.");
          return;
        }

        setDatosPreview(mapeados);
        setPaso(2);
      } catch (err) {
        setErrorTexto("Hubo un error al leer el archivo. Asegurate de que no esté dañado.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const confirmarImportacion = async () => {
    setIsLoading(true);
    setErrorTexto("");

    try {
      // 🔥 CORREGIDO (Backtick al final)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companias/importar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companias: datosPreview }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al importar compañías");
      }

      onSuccess(`¡Se importaron ${data.importados} compañías con éxito!`);
      resetearModal();

    } catch (err: any) {
      setErrorTexto(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UploadCloud size={22} className="text-emerald-600" />
            Importar Compañías
          </h2>
          <button onClick={resetearModal} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {paso === 1 && (
            <div className="flex flex-col gap-4">
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm border border-emerald-100 mb-2">
                <p className="font-bold mb-1">Estructura requerida del Excel:</p>
                <ul className="list-disc pl-5 opacity-90 space-y-1">
                  <li><strong>Columna A:</strong> Nombre / Razón Social (Obligatorio)</li>
                  <li><strong>Columna B:</strong> CUIT (Opcional)</li>
                  <li><strong>Columna C:</strong> Teléfono para Siniestros (Opcional)</li>
                  <li><strong>Columna D:</strong> Email de Contacto (Opcional)</li>
                </ul>
              </div>

              {errorTexto && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 font-medium">
                  <AlertTriangle size={18} /> {errorTexto}
                </div>
              )}

              <label className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group">
                <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <FileText size={28} />
                </div>
                <p className="text-gray-700 font-bold mb-1">Click para subir tu Excel</p>
                <p className="text-gray-400 text-xs">Formato soportado: .xlsx o .xls</p>
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleSubirArchivo} />
              </label>
            </div>
          )}

          {paso === 2 && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div className="mx-auto bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Archivo procesado</h3>
                <p className="text-gray-500">
                  Detectamos <strong className="text-emerald-600 font-black">{datosPreview.length}</strong> compañías válidas listas para importar.
                </p>
              </div>

              {errorTexto && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 font-medium">
                  <AlertTriangle size={18} /> {errorTexto}
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => { setPaso(1); setArchivo(null); setDatosPreview([]); }}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  Cambiar archivo
                </button>
                <button 
                  onClick={confirmarImportacion}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                  {isLoading ? "Importando..." : "Confirmar e Importar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}