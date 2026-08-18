"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/services/api"; 
import { validarRequerido, validarFechaNacimiento } from "@/utils/validaciones";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  siniestroAEditar?: any;
}

const ESTADO_INICIAL = {
  nroSiniestro: "", fechaHecho: "", descripcionInicial: "", estadoSiniestro: "Denuncia Pendiente", polizaId: "",
};

export default function NuevoSiniestroModal({ isOpen, onClose, onSuccess, siniestroAEditar }: Props) {
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [polizas, setPolizas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      apiFetch(`/api/polizas`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setPolizas(data.filter((p: any) => p.estado === "Vigente" || p.estado === "Renovada"));
          }
        })
        .catch((err) => console.error("Error al cargar pólizas:", err));

      if (siniestroAEditar) {
        setFormData({
          ...siniestroAEditar,
          fechaHecho: siniestroAEditar.fechaHecho.split('T')[0], 
          polizaId: siniestroAEditar.polizaId.toString(),
        });
      } else {
        setFormData(ESTADO_INICIAL);
      }
      
      setErrorGlobal("");
      setErrores({}); 
    }
  }, [isOpen, siniestroAEditar]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGlobal("");

    const nuevosErrores: Record<string, string> = {
      polizaId: validarRequerido(formData.polizaId, "Póliza Afectada"),
      descripcionInicial: validarRequerido(formData.descripcionInicial, "Descripción de lo ocurrido"),
      fechaHecho: validarRequerido(formData.fechaHecho, "Fecha del Hecho") || validarFechaNacimiento(formData.fechaHecho, true),
    };

    const erroresFiltrados = Object.fromEntries(Object.entries(nuevosErrores).filter(([_, v]) => v !== ""));

    if (Object.keys(erroresFiltrados).length > 0) {
      setErrores(erroresFiltrados);
      return;
    }

    setIsLoading(true);

    try {
      const url = siniestroAEditar ? `/api/siniestros/${siniestroAEditar.id}` : `/api/siniestros`;
      const method = siniestroAEditar ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al guardar el siniestro");

      onSuccess();
    } catch (err: any) {
      setErrorGlobal(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      {/* 🔥 Modal fondo oscuro */}
      <div className="bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-xl p-6 w-full max-w-lg shadow-xl relative animate-in fade-in zoom-in duration-200 transition-colors">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center gap-2 transition-colors">
          <AlertTriangle className="text-orange-600 dark:text-orange-500" />
          {siniestroAEditar ? "Actualizar Siniestro" : "Reportar Nuevo Siniestro"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorGlobal && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium transition-colors">{errorGlobal}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Póliza Afectada *</label>
            <select 
              name="polizaId" 
              value={formData.polizaId} 
              onChange={handleChange} 
              className={`w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white ${errores.polizaId ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-orange-500 outline-none transition-colors`}
              disabled={!!siniestroAEditar} 
            >
              <option value="" disabled className="dark:bg-gray-800">-- Buscá al cliente o patente --</option>
              {polizas.map((poliza) => (
                <option key={poliza.id} value={poliza.id} className="dark:bg-gray-800">
                  {poliza.asegurado?.nombre} {poliza.asegurado?.apellido} | Patente: {poliza.patente || "N/A"} | Pol: {poliza.nroPoliza}
                </option>
              ))}
            </select>
            {errores.polizaId && <p className="text-red-500 text-xs mt-1 font-medium">{errores.polizaId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Nro Reclamo (Compañía)</label>
              <input 
                type="text" 
                name="nroSiniestro" 
                value={formData.nroSiniestro} 
                onChange={handleChange} 
                placeholder="Ej: 99887766" 
                className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-orange-500 outline-none transition-colors" 
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 transition-colors">Dejar vacío si aún no lo tenés</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Fecha del Hecho *</label>
              <input 
                type="date" 
                name="fechaHecho" 
                value={formData.fechaHecho} 
                onChange={handleChange} 
                className={`w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white ${errores.fechaHecho ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-orange-500 outline-none transition-colors ${!errores.fechaHecho && 'dark:text-gray-300'}`} 
              />
              {errores.fechaHecho && <p className="text-red-500 text-xs mt-1 font-medium">{errores.fechaHecho}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Estado del Trámite</label>
            <select name="estadoSiniestro" value={formData.estadoSiniestro} onChange={handleChange} className="w-full px-3 py-2 border bg-transparent border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-orange-500 outline-none font-medium text-gray-700 dark:text-gray-200 transition-colors">
              <option value="Denuncia Pendiente" className="dark:bg-gray-800">Denuncia Pendiente</option>
              <option value="En Análisis" className="dark:bg-gray-800">En Análisis (Cía de Seguros)</option>
              <option value="Aprobado" className="dark:bg-gray-800">Aprobado / Esperando Pago</option>
              <option value="Pagado" className="dark:bg-gray-800">Pagado / Resuelto</option>
              <option value="Rechazado" className="dark:bg-gray-800">Rechazado</option>
              <option value="Cerrado" className="dark:bg-gray-800">Cerrado Administrativamente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Descripción de lo ocurrido *</label>
            <textarea 
              name="descripcionInicial" 
              value={formData.descripcionInicial} 
              onChange={handleChange} 
              placeholder="Ej: Choque en cadena en Av. San Martín. El tercero cruzó en rojo..."
              rows={4} 
              className={`w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${errores.descripcionInicial ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-orange-500 outline-none resize-none transition-colors`} 
            />
            {errores.descripcionInicial && <p className="text-red-500 text-xs mt-1 font-medium">{errores.descripcionInicial}</p>}
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 transition-colors">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
              <Save size={16} /> {isLoading ? "Guardando..." : "Guardar Siniestro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}