"use client";

import { useState, useEffect } from "react";
import { X, Download, CheckSquare, Square } from "lucide-react";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useAuthStore } from "@/store/authStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  datos: any[];
  nombreArchivo: string;
}

export default function ExportarExcelModal({ isOpen, onClose, datos, nombreArchivo }: Props) {
  const { user } = useAuthStore();
  const [columnasSeleccionadas, setColumnasSeleccionadas] = useState<string[]>([]);
  const [todasLasColumnas, setTodasLasColumnas] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

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

  const ejecutarDescarga = async () => {
    if (columnasSeleccionadas.length === 0) {
      alert("Seleccioná al menos una columna para exportar.");
      return;
    }

    setIsExporting(true);

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "AseguraSimple";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet("Reporte de Cartera", {
        views: [{ showGridLines: false }] // Oculta las líneas base de Excel
      });

      const cantCols = Math.max(3, columnasSeleccionadas.length);

      // 🔥 FORMATO REPORTE Y LOGO (Obligatorio e invisible para el usuario final)
      worksheet.getRow(1).height = 45;
      
      // Espacio blanco para el Logo (Columnas 1 a 2)
      worksheet.mergeCells(1, 1, 1, 2); 
      worksheet.getCell(1, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };

      // Título Verde (Resto de las columnas)
      worksheet.mergeCells(1, 3, 1, cantCols);
      const titulo = worksheet.getCell(1, 3);
      titulo.value = "REPORTE OFICIAL DE CARTERA - ASEGURASIMPLE";
      titulo.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } }; // Verde Emerald
      titulo.alignment = { vertical: 'middle', horizontal: 'center' };

      // Buscar e inyectar el logo centrado
      try {
        const response = await fetch('/logoVerde.png');
        const arrayBuffer = await response.arrayBuffer();
        const logoId = workbook.addImage({ buffer: arrayBuffer, extension: 'png' });
        
        // Empujamos el inicio (tl) un poco más a la derecha y el final (br) más a la izquierda 
        // para que quede centrado en el bloque de 2 columnas.
        worksheet.addImage(logoId, {
          tl: { col: 0.4, row: 0.15 } as any, 
          br: { col: 1.6, row: 0.85 } as any, 
          editAs: 'oneCell' 
        });
      } catch (e) {
        console.warn("No se pudo cargar el logo. Se continuará sin imagen.", e);
      }

      // Fila 2: Subtítulo (Fecha y Usuario)
      worksheet.getRow(2).height = 25;
      worksheet.mergeCells(2, 1, 2, cantCols);
      const subtitulo = worksheet.getCell(2, 1);
      subtitulo.value = ` Generado el: ${new Date().toLocaleString("es-AR")} | Usuario: ${user?.nombre || "Administrador"}`;
      subtitulo.font = { italic: true, color: { argb: 'FF4B5563' } };
      subtitulo.alignment = { vertical: 'middle', horizontal: 'left' };
      subtitulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };

      // Fila 3: Total de Registros
      worksheet.getRow(3).height = 25;
      worksheet.mergeCells(3, 1, 3, cantCols);
      const conteo = worksheet.getCell(3, 1);
      conteo.value = ` Total de registros exportados: ${datos.length}`;
      conteo.font = { bold: true, color: { argb: 'FF1F2937' } };
      conteo.alignment = { vertical: 'middle', horizontal: 'left' };
      conteo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };

      // Fila 4: Espaciador vacío
      const filaInicioDatos = 5;

      // Configuramos el ancho de las columnas
      const columnasDef = columnasSeleccionadas.map(col => ({
        header: col,
        key: col,
        width: 25
      }));
      
      // Aplicamos la cabecera de la tabla en la fila 5
      worksheet.getRow(filaInicioDatos).values = columnasDef.map(c => c.header);
      
      const cabeceraTabla = worksheet.getRow(filaInicioDatos);
      cabeceraTabla.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cabeceraTabla.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } }; 
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });

      // Insertamos los datos
      const datosParaExportar = datos.map(fila => {
        const nuevaFila: any = {};
        columnasSeleccionadas.forEach(col => {
          nuevaFila[col] = fila[col] || "-";
        });
        return nuevaFila;
      });

      datosParaExportar.forEach(d => {
        const row = worksheet.addRow(Object.values(d));
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };
        });
      });

      // 🔥 BLOQUEO DE EDICIÓN (Obligatorio e invisible)
      const passwordInterna = `AseguraSimple_Block_${Date.now()}`;
      await worksheet.protect(passwordInterna, {
        selectLockedCells: true,
        selectUnlockedCells: true,
        formatCells: false,
        formatColumns: false,
        formatRows: false,
        insertColumns: false,
        insertRows: false,
        insertHyperlinks: false,
        deleteColumns: false,
        deleteRows: false,
        sort: false,
        autoFilter: false
      });

      // Generar el archivo y descargarlo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${nombreArchivo}.xlsx`);
      
      onClose();
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Hubo un problema al generar el archivo Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-xl relative animate-in fade-in zoom-in duration-200 transition-colors border border-transparent dark:border-gray-700">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Download size={22} className="text-emerald-600 dark:text-emerald-500" /> Exportar Reporte
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors">
            Se exportarán <strong className="text-gray-800 dark:text-gray-200">{datos.length} registros</strong>. Seleccioná qué datos querés incluir en el reporte oficial:
          </p>

          <div className="flex gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700 transition-colors">
            <button onClick={() => setColumnasSeleccionadas(todasLasColumnas)} className="text-xs font-bold text-emerald-600 dark:text-emerald-500 hover:underline">
              Seleccionar Todas
            </button>
            <button onClick={() => setColumnasSeleccionadas([])} className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:underline transition-colors">
              Deseleccionar Todas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
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
          <button onClick={onClose} disabled={isExporting} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button 
            onClick={ejecutarDescarga}
            disabled={isExporting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
          >
            {isExporting ? "Generando..." : <><Download size={16} /> Descargar Reporte</>}
          </button>
        </div>

      </div>
    </div>
  );
}