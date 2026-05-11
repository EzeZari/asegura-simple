"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companiaAEditar?: any;
}

const ESTADO_INICIAL = {
  nombre: "", cuit: "", telefonoSiniestros: "", email: ""
};

export default function NuevaCompaniaModal({ isOpen, onClose, onSuccess, companiaAEditar }: Props) {
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (companiaAEditar) {
        setFormData(companiaAEditar);
      } else {
        setFormData(ESTADO_INICIAL);
      }
      setError("");
    }
  }, [isOpen, companiaAEditar]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = companiaAEditar 
        ? `http://localhost:3001/api/companias/${companiaAEditar.id}`
        : "http://localhost:3001/api/companias";
      
      const method = companiaAEditar ? "PUT" : "POST";

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
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative animate-in fade-in zoom-in duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">
          {companiaAEditar ? "Editar Compañía" : "Nueva Compañía"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Aseguradora *</label>
            <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: San Cristóbal" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
            <input type="text" name="cuit" value={formData.cuit || ""} onChange={handleChange} placeholder="Ej: 30-12345678-9" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Siniestros / Grúa</label>
            <input type="text" name="telefonoSiniestros" value={formData.telefonoSiniestros || ""} onChange={handleChange} placeholder="Ej: 0800-..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto</label>
            <input type="email" name="email" value={formData.email || ""} onChange={handleChange} placeholder="contacto@compania.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {isLoading ? "Guardando..." : (companiaAEditar ? "Actualizar" : "Guardar")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}