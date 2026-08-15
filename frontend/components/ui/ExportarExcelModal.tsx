"use client";

import { useState, useEffect } from "react";
import { X, Download, CheckSquare, Square } from "lucide-react";
import * as XLSX from "xlsx";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  datos: any[];
  nombreArchivo: string;
}

export default function ExportarExcelModal({ isOpen, onClose, datos, nombreArchivo }: Props) {
  const [columnasSeleccionadas, setColumnasSeleccionadas] = useState<string[]>([]);
  const [todasLasColumnas, setTodasLasColumnas] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && datos.length > 0) {
      const columnas = Object.keys(datos[0]);
      setTodasLasColumnas(columnas);
      setColumnasSeleccionadas(columnas);
    }
  }, [isOpen, datos]);

  if (!isOpen) return null;

  const toggleColumna = (columna: string) => {
    if (columnasSeleccionadas.includes(columna)) {
      setColumnasSeleccionadas(prev => prev.filter(c => c !== columna));
    } else {
      setColumnasSeleccionadas(prev => [...prev, columna]);
    }
  };

  const ejecutarDescarga = () => {
    if (columnasSeleccionadas.length === 0) {
      alert("Seleccioná al menos una columna para exportar.");
      return;
    }

    const datosParaExportar = datos.map(fila => {
      const nuevaFila: any = {};
      todasLasColumnas.forEach(col => {
        if (columnasSeleccionadas.includes(col)) {
          nuevaFila[col] = fila[col] || "-";
        }
      });
      return nuevaFila;
    });

    const worksheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

    worksheet["!cols"] = columnasSeleccionadas.map(() => ({ wch: 20 }));

    XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-xl relative animate-in fade-in zoom-in duration-200 transition-colors border border-transparent dark:border-gray-700">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Download size={22} className="text-emerald-600 dark:text-emerald-500" /> Exportar a Excel
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors">
            Se exportarán <strong className="text-gray-800 dark:text-gray-200">{datos.length} registros</strong>. Seleccioná qué datos querés incluir en la planilla:
          </p>

          <div className="flex gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700 transition-colors">
            <button onClick={() => setColumnasSeleccionadas(todasLasColumnas)} className="text-xs font-bold text-emerald-600 dark:text-emerald-500 hover:underline">
              Seleccionar Todas
            </button>
            <button onClick={() => setColumnasSeleccionadas([])} className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:underline transition-colors">
              Deseleccionar Todas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {todasLasColumnas.map(col => (
              <div 
                key={col} 
                onClick={() => toggleColumna(col)}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className={`${columnasSeleccionadas.includes(col) ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-300 dark:text-gray-600'} group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors`}>
                  {columnasSeleccionadas.includes(col) ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none truncate transition-colors">{col}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-xl border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 transition-colors">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
            Cancelar
          </button>
          <button 
            onClick={ejecutarDescarga}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
          >
            <Download size={16} /> Descargar
          </button>
        </div>

      </div>
    </div>
  );
}