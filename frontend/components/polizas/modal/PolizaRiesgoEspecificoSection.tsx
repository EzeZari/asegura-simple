"use client";

import { PolizaFormData } from "./polizaModal.types";

interface Props {
  formData: PolizaFormData;
  errores: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function PolizaRiesgoEspecificoSection({ formData, errores, onChange }: Props) {
  if (formData.tipoPoliza === "Automotor" || formData.tipoPoliza === "Motovehículo") {
    return (
      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-colors">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 transition-colors">
          Datos del Vehículo{" "}
          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full normal-case transition-colors">
            Opcional
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col justify-end">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              Patente
            </label>
            <input
              type="text"
              name="patente"
              value={formData.patente || ""}
              onChange={onChange}
              placeholder="Ej: AB123CD"
              className={`w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                errores.patente
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-200 dark:border-gray-700"
              } rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none uppercase transition-colors`}
            />
            {errores.patente && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errores.patente}</p>
            )}
          </div>
          <div className="flex flex-col justify-end">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              Marca
            </label>
            <input
              type="text"
              name="marca"
              value={formData.marca || ""}
              onChange={onChange}
              placeholder="Ej: Toyota"
              className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors"
            />
          </div>
          <div className="md:col-span-2 flex flex-col justify-end">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              Modelo Detallado
            </label>
            <input
              type="text"
              name="modelo"
              value={formData.modelo || ""}
              onChange={onChange}
              placeholder="Ej: Corolla 1.8 XEI CVT"
              className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="flex flex-col justify-end">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              Año
            </label>
            <input
              type="text"
              name="anio"
              value={formData.anio || ""}
              onChange={onChange}
              placeholder="Ej: 2023"
              className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors"
            />
          </div>
          <div className="flex flex-col justify-end">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              Color
            </label>
            <input
              type="text"
              name="color"
              value={formData.color || ""}
              onChange={onChange}
              placeholder="Ej: Blanco Perla"
              className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors"
            />
          </div>
          <div className="flex flex-col justify-end">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              Nro. de Motor
            </label>
            <input
              type="text"
              name="motor"
              value={formData.motor || ""}
              onChange={onChange}
              placeholder="Opcional"
              className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none uppercase transition-colors"
            />
          </div>
          <div className="flex flex-col justify-end">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              Nro. de Chasis
            </label>
            <input
              type="text"
              name="chasis"
              value={formData.chasis || ""}
              onChange={onChange}
              placeholder="Opcional"
              className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none uppercase transition-colors"
            />
          </div>
        </div>
      </div>
    );
  }

  if (
    formData.tipoPoliza === "Combinado familiar" ||
    formData.tipoPoliza === "Integral para comercio"
  ) {
    return (
      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-colors">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 transition-colors">
          Ubicación del Riesgo{" "}
          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full normal-case transition-colors">
            Opcional
          </span>
        </h3>
        <div className="flex flex-col justify-end">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
            Dirección Asegurada
          </label>
          <input
            type="text"
            name="ubicacionRiesgo"
            value={formData.ubicacionRiesgo || ""}
            onChange={onChange}
            placeholder="Ej: Av. San Martín 1234"
            className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors"
          />
        </div>
      </div>
    );
  }

  if (formData.tipoPoliza === "ART") {
    return (
      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-colors">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 transition-colors">
          Datos Laborales{" "}
          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full normal-case transition-colors">
            Opcional
          </span>
        </h3>
        <div className="flex flex-col justify-end">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
            Cantidad de Empleados
          </label>
          <input
            type="number"
            name="cantidadEmpleados"
            value={formData.cantidadEmpleados || ""}
            onChange={onChange}
            placeholder="Ej: 15"
            className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors"
          />
        </div>
      </div>
    );
  }

  return null;
}