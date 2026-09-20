"use client";

import { Info, UploadCloud, Download } from "lucide-react";

interface Props {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescargarTemplate: () => void;
}

export default function PasoUploadAsegurados({ fileInputRef, onFileChange, onDescargarTemplate }: Props) {
  return (
    <div className="flex flex-col gap-5 py-2 max-w-3xl mx-auto">
      {/* Caja de ayuda con formato de columnas */}
      <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Info size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <p className="text-sm font-bold text-blue-900 dark:text-blue-300">¿Cómo preparar tu Excel de Clientes?</p>
        </div>
        <p className="text-xs text-blue-800/80 dark:text-blue-200 mb-3">
          El sistema lee automáticamente todas las columnas del cliente. <strong>Nombre</strong> y <strong>DNI_CUIT</strong> son obligatorios:
        </p>

        <div className="overflow-x-auto rounded-xl border border-blue-200/60 dark:border-blue-900/50 bg-white dark:bg-gray-950/60 shadow-sm">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-blue-100/50 dark:bg-blue-900/40 text-blue-950 dark:text-blue-200 font-bold">
                <th className="px-3 py-2 text-left whitespace-nowrap">NOMBRE *</th>
                <th className="px-3 py-2 text-left whitespace-nowrap">APELLIDO</th>
                <th className="px-3 py-2 text-left whitespace-nowrap">DNI_CUIT *</th>
                <th className="px-3 py-2 text-left whitespace-nowrap">TIPO</th>
                <th className="px-3 py-2 text-left whitespace-nowrap">CONDICIONIVA</th>
                <th className="px-3 py-2 text-left whitespace-nowrap">TELEFONO</th>
                <th className="px-3 py-2 text-left whitespace-nowrap">EMAIL</th>
                <th className="px-3 py-2 text-left whitespace-nowrap">DIRECCION</th>
                <th className="px-3 py-2 text-left whitespace-nowrap">CODIGOPOSTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <td className="px-3 py-2 font-medium whitespace-nowrap">Juan</td>
                <td className="px-3 py-2 whitespace-nowrap">Pérez</td>
                <td className="px-3 py-2 font-mono whitespace-nowrap">20321112224</td>
                <td className="px-3 py-2 whitespace-nowrap">Individuo</td>
                <td className="px-3 py-2 whitespace-nowrap">Consumidor Final</td>
                <td className="px-3 py-2 whitespace-nowrap">341555666</td>
                <td className="px-3 py-2 whitespace-nowrap">juan@mail.com</td>
                <td className="px-3 py-2 whitespace-nowrap">Av. San Martín 1234</td>
                <td className="px-3 py-2 whitespace-nowrap">2000</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-blue-700 dark:text-blue-300/80 mt-3 italic">
          * Si el cliente ya existe (mismo DNI o CUIT), será marcado en el informe final para evitar duplicaciones.
        </p>
      </div>

      {/* Zona de carga y arrastre */}
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-10 text-center cursor-pointer hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-all group"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform text-emerald-600 dark:text-emerald-400">
          <UploadCloud size={32} />
        </div>
        <p className="font-bold text-gray-900 dark:text-white text-base md:text-lg">Seleccioná o arrastrá tu planilla Excel</p>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Archivos compatibles: .xlsx, .xls y .csv</p>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFileChange} />
      </div>

      {/* Descarga de plantilla */}
      <button
        type="button"
        onClick={onDescargarTemplate}
        className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl text-xs md:text-sm font-bold transition-all shadow-sm"
      >
        <Download size={16} /> Descargar planilla modelo con ejemplos
      </button>
    </div>
  );
}