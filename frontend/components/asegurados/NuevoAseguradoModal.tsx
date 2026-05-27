"use client";

import { useState, useEffect } from "react";
import { X, User } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clienteAEditar?: any; // <-- Le pasamos el cliente si vamos a editar
}

const ESTADO_INICIAL = {
  nombre: "", apellido: "", tipo: "Individuo", dni: "", 
  fechaNacimiento: "", condicionIva: "Consumidor Final", 
  email: "", telefono: "", direccion: "", codigoPostal: "", activo: true
};

export default function NuevoAseguradoModal({ isOpen, onClose, onSuccess, clienteAEditar }: Props) {
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Si abrimos el modal y hay un cliente para editar, llenamos los campos
  useEffect(() => {
    if (clienteAEditar) {
      setFormData({
        ...ESTADO_INICIAL,
        ...clienteAEditar,
        // Formateamos la fecha para que el input type="date" la entienda (YYYY-MM-DD)
        fechaNacimiento: clienteAEditar.fechaNacimiento ? clienteAEditar.fechaNacimiento.split('T')[0] : "",
      });
    } else {
      setFormData(ESTADO_INICIAL); // Si es nuevo, arranca vacío
    }
  }, [clienteAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Magia: Si hay cliente editamos (PUT), sino creamos (POST)
      const url = clienteAEditar 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/asegurados/${clienteAEditar.id}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/api/asegurados`;
      
      const method = clienteAEditar ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al guardar");

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">
          {clienteAEditar ? "Editar Asegurado" : "Nuevo Asegurado"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Datos Personales y Fiscales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo / Razón Social *</label>
                <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none bg-white">
                  <option value="Individuo">Individuo</option>
                  <option value="Empresa">Empresa</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DNI / CUIT *</label>
                <input required type="text" name="dni" value={formData.dni} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condición IVA</label>
                <select name="condicionIva" value={formData.condicionIva} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none bg-white">
                  <option value="Consumidor Final">Consumidor Final</option>
                  <option value="Monotributo">Monotributo</option>
                  <option value="Responsable Inscripto">Responsable Inscripto</option>
                  <option value="Exento">Exento</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contacto y Domicilio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Principal</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Celular</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">C. Postal</label>
                <input type="text" name="codigoPostal" value={formData.codigoPostal} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {isLoading ? "Guardando..." : "Guardar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}