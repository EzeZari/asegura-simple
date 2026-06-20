"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/services/api"; 
// 🔥 IMPORTAMOS LAS VALIDACIONES CENTRALIZADAS
import { validarRequerido, validarFechaNacimiento } from "@/utils/validaciones";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  siniestroAEditar?: any;
}

const ESTADO_INICIAL = {
  nroSiniestro: "",
  fechaHecho: "",
  descripcionInicial: "",
  estadoSiniestro: "Denuncia Pendiente",
  polizaId: "",
};

export default function NuevoSiniestroModal({ isOpen, onClose, onSuccess, siniestroAEditar }: Props) {
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [polizas, setPolizas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 🔥 ESTADOS PARA EL MANEJO DE ERRORES
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
      setErrores({}); // Limpiamos los errores visuales al abrir
    }
  }, [isOpen, siniestroAEditar]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Borramos el cartelito rojo cuando el usuario empieza a escribir
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGlobal("");

    // 🔥 EJECUTAMOS LAS VALIDACIONES
    const nuevosErrores: Record<string, string> = {
      polizaId: validarRequerido(formData.polizaId, "Póliza Afectada"),
      descripcionInicial: validarRequerido(formData.descripcionInicial, "Descripción de lo ocurrido"),
      // Validamos que haya fecha, y que no sea en el futuro (usamos la misma regla de nacimiento)
      fechaHecho: validarRequerido(formData.fechaHecho, "Fecha del Hecho") || validarFechaNacimiento(formData.fechaHecho, true),
    };

    // Filtramos los que tienen texto de error
    const erroresFiltrados = Object.fromEntries(
      Object.entries(nuevosErrores).filter(([_, v]) => v !== "")
    );

    // Si hay errores, bloqueamos el guardado
    if (Object.keys(erroresFiltrados).length > 0) {
      setErrores(erroresFiltrados);
      return;
    }

    setIsLoading(true);

    try {
      const url = siniestroAEditar 
        ? `/api/siniestros/${siniestroAEditar.id}`
        : `/api/siniestros`;
      
      const method = siniestroAEditar ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl relative animate-in fade-in zoom-in duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center gap-2">
          <AlertTriangle className="text-orange-600" />
          {siniestroAEditar ? "Actualizar Siniestro" : "Reportar Nuevo Siniestro"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorGlobal && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{errorGlobal}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Póliza Afectada *</label>
            <select 
              name="polizaId" 
              value={formData.polizaId} 
              onChange={handleChange} 
              className={`w-full px-3 py-2 border ${errores.polizaId ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-600 outline-none bg-white`}
              disabled={!!siniestroAEditar} 
            >
              <option value="" disabled>-- Buscá al cliente o patente --</option>
              {polizas.map((poliza) => (
                <option key={poliza.id} value={poliza.id}>
                  {poliza.asegurado?.nombre} {poliza.asegurado?.apellido} | Patente: {poliza.patente || "N/A"} | Pol: {poliza.nroPoliza}
                </option>
              ))}
            </select>
            {errores.polizaId && <p className="text-red-500 text-xs mt-1 font-medium">{errores.polizaId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nro Reclamo (Compañía)</label>
              <input 
                type="text" 
                name="nroSiniestro" 
                value={formData.nroSiniestro} 
                onChange={handleChange} 
                placeholder="Ej: 99887766" 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 outline-none" 
              />
              <p className="text-[10px] text-gray-400 mt-1">Dejar vacío si aún no lo tenés</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Hecho *</label>
              <input 
                type="date" 
                name="fechaHecho" 
                value={formData.fechaHecho} 
                onChange={handleChange} 
                className={`w-full px-3 py-2 border ${errores.fechaHecho ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-600 outline-none text-gray-600`} 
              />
              {errores.fechaHecho && <p className="text-red-500 text-xs mt-1 font-medium">{errores.fechaHecho}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Trámite</label>
            <select name="estadoSiniestro" value={formData.estadoSiniestro} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 outline-none bg-white font-medium text-gray-700">
              <option value="Denuncia Pendiente">Denuncia Pendiente</option>
              <option value="En Análisis">En Análisis (Cía de Seguros)</option>
              <option value="Aprobado">Aprobado / Esperando Pago</option>
              <option value="Pagado">Pagado / Resuelto</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Cerrado">Cerrado Administrativamente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de lo ocurrido *</label>
            <textarea 
              name="descripcionInicial" 
              value={formData.descripcionInicial} 
              onChange={handleChange} 
              placeholder="Ej: Choque en cadena en Av. San Martín. El tercero cruzó en rojo..."
              rows={4} 
              className={`w-full px-3 py-2 border ${errores.descripcionInicial ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-600 outline-none resize-none`} 
            />
            {errores.descripcionInicial && <p className="text-red-500 text-xs mt-1 font-medium">{errores.descripcionInicial}</p>}
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
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