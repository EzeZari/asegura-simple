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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl relative animate-in fade-in zoom-in duration-200">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Download size={22} className="text-emerald-600" /> Exportar a Excel
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Se exportarán <strong className="text-gray-800">{datos.length} registros</strong>. Seleccioná qué datos querés incluir en la planilla:
          </p>

          <div className="flex gap-4 mb-4 pb-4 border-b border-gray-100">
            <button onClick={() => setColumnasSeleccionadas(todasLasColumnas)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
              Seleccionar Todas
            </button>
            <button onClick={() => setColumnasSeleccionadas([])} className="text-xs font-bold text-gray-400 hover:text-gray-600 hover:underline">
              Deseleccionar Todas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto">
            {todasLasColumnas.map(col => (
              <div 
                key={col} 
                onClick={() => toggleColumna(col)}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className={`${columnasSeleccionadas.includes(col) ? 'text-emerald-600' : 'text-gray-300'} group-hover:text-emerald-500 transition-colors`}>
                  {columnasSeleccionadas.includes(col) ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <span className="text-sm font-medium text-gray-700 select-none truncate">{col}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50/50 rounded-b-xl border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">
            Cancelar
          </button>
          <button 
            onClick={ejecutarDescarga}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
          >
            <Download size={16} /> Descargar Archivo
          </button>
        </div>

      </div>
    </div>
  );
}