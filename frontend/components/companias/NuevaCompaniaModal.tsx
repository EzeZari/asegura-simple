"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiFetch } from "@/services/api"; 
import { validarRequerido, validarDniCuit, validarEmail, validarTelefono } from "@/utils/validaciones";

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
  const [errorGlobal, setErrorGlobal] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (companiaAEditar) {
        setFormData(companiaAEditar);
      } else {
        setFormData(ESTADO_INICIAL);
      }
      setErrorGlobal("");
      setErrores({});
    }
  }, [isOpen, companiaAEditar]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: "" });
      
      // 🔥 TRUCO DE UX: Si estaba marcando error en los dos porque faltaba contacto,
      // al escribir en uno, borramos el error del otro también.
      if (e.target.name === "email") setErrores(prev => ({ ...prev, telefonoSiniestros: "" }));
      if (e.target.name === "telefonoSiniestros") setErrores(prev => ({ ...prev, email: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGlobal("");

    const nuevosErrores: Record<string, string> = {
      nombre: validarRequerido(formData.nombre, "Nombre de la Aseguradora"),
    };

    if (formData.cuit && formData.cuit.trim() !== "") {
      nuevosErrores.cuit = validarDniCuit(formData.cuit);
    }

    // 🔥 VALIDACIÓN CRUZADA: ¿Están los dos vacíos?
    const emailVacio = !formData.email || formData.email.trim() === "";
    const telVacio = !formData.telefonoSiniestros || formData.telefonoSiniestros.trim() === "";

    if (emailVacio && telVacio) {
      nuevosErrores.email = "Completá al menos el Email o el Teléfono.";
      nuevosErrores.telefonoSiniestros = "Completá al menos el Teléfono o el Email.";
    } else {
      // Si completaron al menos uno, validamos el formato del que hayan completado
      if (!emailVacio) nuevosErrores.email = validarEmail(formData.email, false);
      if (!telVacio) nuevosErrores.telefonoSiniestros = validarTelefono(formData.telefonoSiniestros, false);
    }

    const erroresFiltrados = Object.fromEntries(
      Object.entries(nuevosErrores).filter(([_, v]) => v !== "")
    );

    if (Object.keys(erroresFiltrados).length > 0) {
      setErrores(erroresFiltrados);
      return;
    }

    setIsLoading(true);

    try {
      const url = companiaAEditar 
        ? `/api/companias/${companiaAEditar.id}`
        : `/api/companias`; 
      
      const method = companiaAEditar ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al guardar");

      onSuccess();
    } catch (err: any) {
      setErrorGlobal(err.message);
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
          {errorGlobal && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{errorGlobal}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Aseguradora *</label>
            <input 
              type="text" 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleChange} 
              placeholder="Ej: San Cristóbal" 
              className={`w-full px-3 py-2 border ${errores.nombre ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-600 outline-none`} 
            />
            {errores.nombre && <p className="text-red-500 text-xs mt-1 font-medium">{errores.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
            <input 
              type="text" 
              name="cuit" 
              value={formData.cuit || ""} 
              onChange={handleChange} 
              placeholder="Ej: 30-12345678-9" 
              className={`w-full px-3 py-2 border ${errores.cuit ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-600 outline-none`} 
            />
            {errores.cuit && <p className="text-red-500 text-xs mt-1 font-medium">{errores.cuit}</p>}
          </div>

          <div className="pt-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Medios de Contacto</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                  Teléfono Siniestros / Grúa
                  <span className="text-xs text-gray-400 font-normal">Requerido si no hay email</span>
                </label>
                <input 
                  type="text" 
                  name="telefonoSiniestros" 
                  value={formData.telefonoSiniestros || ""} 
                  onChange={handleChange} 
                  placeholder="Ej: 0800-..." 
                  className={`w-full px-3 py-2 border ${errores.telefonoSiniestros ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-600 outline-none`} 
                />
                {errores.telefonoSiniestros && <p className="text-red-500 text-xs mt-1 font-medium">{errores.telefonoSiniestros}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                  Email de Contacto
                  <span className="text-xs text-gray-400 font-normal">Requerido si no hay teléfono</span>
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email || ""} 
                  onChange={handleChange} 
                  placeholder="contacto@compania.com" 
                  className={`w-full px-3 py-2 border ${errores.email ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-600 outline-none`} 
                />
                {errores.email && <p className="text-red-500 text-xs mt-1 font-medium">{errores.email}</p>}
              </div>
            </div>
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