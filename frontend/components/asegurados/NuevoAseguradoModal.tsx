"use client";

import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NuevoAseguradoModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Nuevo Asegurado</h2>

        <form className="flex flex-col gap-6">
          
          {/* Sección 1: Datos Personales / Fiscales */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Datos Personales y Fiscales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo / Razón Social</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-700 bg-white">
                  <option>Individuo</option>
                  <option>Empresa</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DNI / CUIT</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condición IVA</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-700 bg-white">
                  <option>Consumidor Final</option>
                  <option>Monotributo</option>
                  <option>Responsable Inscripto</option>
                  <option>Exento</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección 2: Contacto y Domicilio */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contacto y Domicilio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Principal</label>
                <input type="email" placeholder="ejemplo@correo.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Celular</label>
                <input type="text" placeholder="Ej: 341 1234567" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (Calle y Número)</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600" />
              </div>
            </div>
          </div>

          {/* Botonera de acciones */}
          <div className="mt-4 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="button"
              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium transition-colors"
            >
              Guardar Cliente
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}