"use client";

import { useState } from "react";
import { HelpCircle, CheckCircle2, X } from "lucide-react";
import { PolizaFormData } from "./polizaModal.types";

interface Props {
  formData: PolizaFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function PolizaRefacturacionSection({ formData, onChange }: Props) {
  const [showAyuda, setShowAyuda] = useState(false);

  return (
    <div className="flex flex-col gap-4 mt-4 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700 relative">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          B. Configuración de refacturación
          <button
            type="button"
            onClick={() => setShowAyuda(!showAyuda)}
            className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 p-1 rounded-full transition-colors"
          >
            <HelpCircle size={16} />
          </button>
        </h4>
        <div className="flex items-center gap-2">
          <label
            htmlFor="tieneRefacturacion"
            className="text-xs font-semibold text-gray-500 cursor-pointer"
          >
            ¿Tiene refacturación?
          </label>
          <input
            type="checkbox"
            id="tieneRefacturacion"
            name="tieneRefacturacion"
            checked={Boolean(formData.tieneRefacturacion)}
            onChange={onChange}
            className="w-4 h-4 text-gray-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-gray-500 cursor-pointer"
          />
        </div>
      </div>

      {showAyuda && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-4 rounded-xl text-sm text-blue-900 dark:text-blue-200 mb-2 relative">
          <button
            type="button"
            onClick={() => setShowAyuda(false)}
            className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 p-1"
          >
            <X size={16} />
          </button>
          <p className="font-bold mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={16} /> ¿Cómo completar estos datos?
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs opacity-90">
            <li>
              <strong className="font-bold">Próxima Fecha (Mes):</strong> Le dice al sistema a partir de qué mes empezar a calcular las cuotas. Si el cliente ya pagó meses anteriores, poné la fecha de la primera cuota impaga.
            </li>
            <li>
              <strong className="font-bold">Día Habitual (Día):</strong> Fuerza a que <i>todas</i> las cuotas venzan exactamente ese día (Ej: 16), evitando que se corran en meses de 31 días.
            </li>
            <li>
              <strong className="font-bold">Ejemplo:</strong> Si querés que le venza todos los 16 empezando desde Noviembre, ponés{" "}
              <code className="bg-white/50 px-1 rounded">Próxima Fecha: 15/11/2026</code> y{" "}
              <code className="bg-white/50 px-1 rounded">Día Habitual: 16</code>.
            </li>
          </ul>
        </div>
      )}

      {formData.tieneRefacturacion && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col justify-end">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Frecuencia</label>
            <select
              name="frecuenciaRefacturacion"
              value={formData.frecuenciaRefacturacion || "Mensual"}
              onChange={onChange}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              <option value="Mensual">Mensual</option>
              <option value="Bimestral">Bimestral</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Semestral">Semestral</option>
              <option value="Anual">Anual</option>
              <option value="Personalizada">Personalizada</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Próxima Fecha</label>
            <input
              type="date"
              name="fechaRefacturacion"
              value={formData.fechaRefacturacion ? formData.fechaRefacturacion.split("T")[0] : ""}
              onChange={onChange}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Día Habitual (Opcional)
            </label>
            <input
              type="number"
              name="diaHabitualPago"
              value={formData.diaHabitualPago ?? ""}
              onChange={onChange}
              placeholder="Ej: 16"
              min="1"
              max="31"
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}